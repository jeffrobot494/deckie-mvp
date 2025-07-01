import Card from '../models/Card.js';
import visionService from './vision.js';

class CardProcessor {
  constructor() {
    this.processingQueues = new Set(); // Track which deckies are being processed
  }

  async processCardsForDeckie(deckieId) {
    // Prevent duplicate processing
    if (this.processingQueues.has(deckieId)) {
      console.log(`⏭️  Deckie ${deckieId} already being processed, skipping`);
      return;
    }

    this.processingQueues.add(deckieId);
    console.log(`🚀 Starting card processing for deckie ${deckieId}`);

    try {
      // Get all pending cards for this deckbuilder
      const pendingCards = await Card.getPendingCards(deckieId);
      
      if (pendingCards.length === 0) {
        console.log(`✅ No pending cards for deckie ${deckieId}`);
        return;
      }

      console.log(`📋 Found ${pendingCards.length} cards to process for deckie ${deckieId}`);

      // Process each card with individual error handling
      for (const card of pendingCards) {
        await this.processIndividualCard(card);
      }

      console.log(`🎉 Completed processing ${pendingCards.length} cards for deckie ${deckieId}`);

    } catch (error) {
      console.error(`❌ Critical error processing cards for deckie ${deckieId}:`, error.message);
      
      // Even if there's a critical error, try to set fallback names for any remaining cards
      try {
        const stillPendingCards = await Card.getPendingCards(deckieId);
        for (const card of stillPendingCards) {
          const fallbackName = visionService.generateFallbackName(card.image_url);
          await Card.updateCardName(card.id, fallbackName);
          console.log(`🔄 Emergency fallback for card ${card.id}: "${fallbackName}"`);
        }
      } catch (fallbackError) {
        console.error(`❌ Failed to set emergency fallbacks:`, fallbackError.message);
      }
    } finally {
      // Always remove from processing queue
      this.processingQueues.delete(deckieId);
    }
  }

  async processIndividualCard(card) {
    try {
      console.log(`🔍 Processing card ${card.id}: ${card.image_url}`);
      
      // Extract card name using Vision API (with built-in fallback handling)
      const cardName = await visionService.extractCardName(card.image_url);
      
      // Update the database
      await Card.updateCardName(card.id, cardName);
      
      console.log(`✅ Updated card ${card.id} with name: "${cardName}"`);
      
    } catch (error) {
      console.error(`❌ Failed to process card ${card.id}:`, error.message);
      
      try {
        // Set a fallback name so it doesn't stay pending forever
        const fallbackName = visionService.generateFallbackName(card.image_url);
        await Card.updateCardName(card.id, fallbackName);
        console.log(`🔄 Set fallback name for card ${card.id}: "${fallbackName}"`);
      } catch (dbError) {
        console.error(`❌ Failed to set fallback for card ${card.id}:`, dbError.message);
        // This card will remain in pending state, but won't crash the server
      }
    }
  }

  async triggerProcessing(deckieId) {
    // Start processing in the background (don't await)
    this.processCardsForDeckie(deckieId).catch(error => {
      console.error(`❌ Background processing failed for deckie ${deckieId}:`, error.message);
    });
    
    console.log(`🔄 Triggered background processing for deckie ${deckieId}`);
  }
}

export default new CardProcessor();