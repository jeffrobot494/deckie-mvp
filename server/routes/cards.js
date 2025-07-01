import express from 'express';
import Card from '../models/Card.js';
import Deckie from '../models/Deckie.js';

const router = express.Router();

// Get all cards for a deckbuilder
router.get('/:deckieUrl', async (req, res) => {
  try {
    const { deckieUrl } = req.params;
    
    if (!deckieUrl || deckieUrl.length !== 12) {
      return res.status(400).json({ error: 'Invalid deckie URL' });
    }

    // Verify deckbuilder exists
    const deckie = await Deckie.findByUrl(deckieUrl);
    if (!deckie) {
      return res.status(404).json({ error: 'Deckbuilder not found' });
    }

    // Get all cards for this deckbuilder
    const cards = await Card.findByDeckieUrl(deckieUrl);
    
    res.json({
      cards: cards.map(card => ({
        id: card.id,
        imageUrl: card.image_url,
        cardName: card.card_name || generatePlaceholderName(card.image_url),
        isProcessing: !card.card_name
      }))
    });

  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get processing status for a deckbuilder
router.get('/:deckieUrl/status', async (req, res) => {
  try {
    const { deckieUrl } = req.params;
    
    if (!deckieUrl || deckieUrl.length !== 12) {
      return res.status(400).json({ error: 'Invalid deckie URL' });
    }

    // Verify deckbuilder exists
    const deckie = await Deckie.findByUrl(deckieUrl);
    if (!deckie) {
      return res.status(404).json({ error: 'Deckbuilder not found' });
    }

    // Get processing status
    const status = await Card.getProcessingStatusByUrl(deckieUrl);
    
    res.json({
      ...status,
      message: status.isComplete 
        ? 'Card name extraction complete!' 
        : `Processing ${status.pendingCards} of ${status.totalCards} cards...`
    });

  } catch (error) {
    console.error('Error fetching processing status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to generate placeholder names
function generatePlaceholderName(imageUrl) {
  try {
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const nameWithoutExtension = filename.split('.')[0];
    return nameWithoutExtension
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      || 'Processing...';
  } catch (error) {
    return 'Processing...';
  }
}

export default router;