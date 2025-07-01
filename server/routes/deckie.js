import express from 'express';
import Deckie from '../models/Deckie.js';
import Card from '../models/Card.js';
import nanoid from '../utils/nanoid.js';
import cardProcessor from '../services/cardProcessor.js';
import { validateDeckieCreation } from '../middleware/validation.js';

const router = express.Router();

// Create new deckbuilder
router.post('/', validateDeckieCreation, async (req, res) => {
  try {
    const { gameName, theme, imageUrls } = req.body;
    const deckieUrl = nanoid();

    // Create the deckbuilder
    const deckie = await Deckie.create({
      deckieUrl,
      gameName: gameName.trim(),
      theme
    });

    // Create cards for this deckbuilder
    await Card.createMany(deckie.id, imageUrls);

    // Trigger background Vision API processing
    cardProcessor.triggerProcessing(deckie.id);

    res.status(201).json({
      deckieUrl: deckie.deckie_url,
      message: 'Deckbuilder created successfully'
    });
  } catch (error) {
    console.error('Error creating deckie:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get deckbuilder by URL
router.get('/:deckieUrl', async (req, res) => {
  try {
    const { deckieUrl } = req.params;
    
    if (!deckieUrl || deckieUrl.length !== 12) {
      return res.status(400).json({ error: 'Invalid deckie URL' });
    }

    const deckie = await Deckie.findByUrl(deckieUrl);
    
    if (!deckie) {
      return res.status(404).json({ error: 'Deckbuilder not found' });
    }

    res.json({
      gameName: deckie.game_name,
      theme: deckie.theme
    });
  } catch (error) {
    console.error('Error fetching deckie:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;