import express from 'express';
import Deckie from '../models/Deckie.js';
import nanoid from '../utils/nanoid.js';
import { validateDeckieCreation } from '../middleware/validation.js';

const router = express.Router();

// Create new deckbuilder
router.post('/', validateDeckieCreation, async (req, res) => {
  try {
    const { gameName, theme, imageUrls } = req.body;
    const deckieUrl = nanoid();

    const deckie = await Deckie.create({
      deckieUrl,
      gameName: gameName.trim(),
      theme,
      imageUrls
    });

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
      theme: deckie.theme,
      imageUrls: deckie.image_urls
    });
  } catch (error) {
    console.error('Error fetching deckie:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;