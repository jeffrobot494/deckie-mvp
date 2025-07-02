import sharp from 'sharp';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import Card from '../models/Card.js';
import DeckImage from '../models/DeckImage.js';

// Configuration for TTS grid
const CARD_WIDTH = 300;
const CARD_HEIGHT = 420;
const GRID_COLS = 10;
const GRID_ROWS = 7;
const MAX_CARDS = GRID_COLS * GRID_ROWS; // 70 cards maximum

/**
 * Generate a hash for the deck composition to avoid duplicate processing
 * @param {Array} deckCards - Array of {cardName, quantity} objects
 * @returns {string} Hash of the deck composition
 */
function generateDeckHash(deckCards) {
  // Sort cards by name and create a consistent string representation
  const sortedCards = deckCards
    .sort((a, b) => a.cardName.localeCompare(b.cardName))
    .map(card => `${card.cardName}:${card.quantity}`)
    .join('|');
  
  return crypto.createHash('md5').update(sortedCards).digest('hex');
}

/**
 * Create a blank white card image
 * @returns {Promise<Buffer>} Buffer containing blank card image
 */
async function createBlankCard() {
  return sharp({
    create: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .png()
  .toBuffer();
}

/**
 * Fetch and process a card image from Cloudinary URL
 * @param {string} imageUrl - Cloudinary URL of the card image
 * @returns {Promise<Buffer>} Processed card image buffer
 */
async function processCardImage(imageUrl) {
  try {
    // Fetch image from Cloudinary URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const imageBuffer = await response.arrayBuffer();
    
    // Resize and process the image to exact card dimensions
    return await sharp(Buffer.from(imageBuffer))
      .resize(CARD_WIDTH, CARD_HEIGHT, {
        fit: 'fill',
        withoutEnlargement: false
      })
      .png()
      .toBuffer();
  } catch (error) {
    console.error(`Error processing card image ${imageUrl}:`, error.message);
    // Return blank card on error
    return await createBlankCard();
  }
}

/**
 * Create the TTS deck sheet image
 * @param {Array} imageBuffers - Array of processed card image buffers
 * @returns {Promise<Buffer>} Final deck sheet image buffer
 */
async function createDeckSheet(imageBuffers) {
  const totalWidth = CARD_WIDTH * GRID_COLS;
  const totalHeight = CARD_HEIGHT * GRID_ROWS;
  
  // Create base white image
  const baseImage = await sharp({
    create: {
      width: totalWidth,
      height: totalHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  }).png().toBuffer();
  
  // Prepare composite array for sharp
  const compositeArray = [];
  
  for (let i = 0; i < Math.min(imageBuffers.length, MAX_CARDS); i++) {
    const row = Math.floor(i / GRID_COLS);
    const col = i % GRID_COLS;
    
    const left = col * CARD_WIDTH;
    const top = row * CARD_HEIGHT;
    
    compositeArray.push({
      input: imageBuffers[i],
      left: left,
      top: top
    });
  }
  
  // Create the composite image
  return await sharp(baseImage)
    .composite(compositeArray)
    .png()
    .toBuffer();
}

/**
 * Upload the deck sheet to Cloudinary
 * @param {Buffer} imageBuffer - The deck sheet image buffer
 * @param {string} deckieUrl - The deckie URL for naming
 * @returns {Promise<string>} Cloudinary URL of uploaded image
 */
async function uploadToCloudinary(imageBuffer, deckieUrl) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'deckie-tts-exports',
        public_id: `tts-deck-${deckieUrl}-${Date.now()}`,
        format: 'png',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    
    uploadStream.end(imageBuffer);
  });
}

/**
 * Main function to export deck as TTS image
 * @param {string} deckieUrl - The deckie URL
 * @param {Array} deckCards - Array of {cardName, quantity} objects
 * @returns {Promise<Object>} Result object with success status and image URL
 */
export async function exportToTTS(deckieUrl, deckCards) {
  try {
    console.log(`Starting TTS export for deckie: ${deckieUrl}`);
    
    // Generate hash for this deck composition
    const deckHash = generateDeckHash(deckCards);
    
    // Get deckie ID
    const cards = await Card.findByDeckieUrl(deckieUrl);
    if (!cards.length) {
      throw new Error('No cards found for this deckbuilder');
    }
    const deckieId = cards[0].deckie_id;
    
    // Check if we already have this exact deck composition
    const existingDeckImage = await DeckImage.findByDeckieAndHash(deckieId, deckHash);
    if (existingDeckImage) {
      console.log('Using cached TTS export');
      return {
        success: true,
        imageUrl: existingDeckImage.image_url,
        cached: true
      };
    }
    
    // Create a map of card names to image URLs
    const cardImageMap = new Map();
    cards.forEach(card => {
      if (card.card_name && card.image_url) {
        cardImageMap.set(card.card_name, card.image_url);
      }
    });
    
    // Expand deck cards into individual card slots
    const cardSlots = [];
    for (const { cardName, quantity } of deckCards) {
      for (let i = 0; i < quantity && cardSlots.length < MAX_CARDS; i++) {
        cardSlots.push(cardName);
      }
    }
    
    console.log(`Processing ${cardSlots.length} card slots`);
    
    // Process all card images
    const imageBuffers = [];
    const blankCard = await createBlankCard();
    
    for (let i = 0; i < MAX_CARDS; i++) {
      if (i < cardSlots.length) {
        const cardName = cardSlots[i];
        const imageUrl = cardImageMap.get(cardName);
        
        if (imageUrl) {
          const processedImage = await processCardImage(imageUrl);
          imageBuffers.push(processedImage);
        } else {
          // Card not found, use blank
          imageBuffers.push(blankCard);
        }
      } else {
        // Fill remaining slots with blank cards
        imageBuffers.push(blankCard);
      }
    }
    
    // Create the deck sheet
    console.log('Creating deck sheet...');
    const deckSheetBuffer = await createDeckSheet(imageBuffers);
    
    // Upload to Cloudinary
    console.log('Uploading to Cloudinary...');
    const imageUrl = await uploadToCloudinary(deckSheetBuffer, deckieUrl);
    
    // Save to database
    await DeckImage.create(deckieId, deckHash, imageUrl);
    
    console.log(`TTS export completed: ${imageUrl}`);
    
    return {
      success: true,
      imageUrl: imageUrl,
      cached: false
    };
    
  } catch (error) {
    console.error('TTS export failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}