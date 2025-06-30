import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const MAX_FILES = parseInt(process.env.MAX_FILES_PER_UPLOAD) || 250;
const ALLOWED_THEMES = ['light', 'dark', 'neon'];

export const validateDeckieCreation = (req, res, next) => {
  const { gameName, theme, imageUrls } = req.body;

  if (!gameName || typeof gameName !== 'string' || gameName.trim().length === 0) {
    return res.status(400).json({ error: 'Game name is required' });
  }

  if (gameName.length > 255) {
    return res.status(400).json({ error: 'Game name is too long' });
  }

  if (!theme || !ALLOWED_THEMES.includes(theme)) {
    return res.status(400).json({ error: 'Valid theme is required (light, dark, or neon)' });
  }

  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    return res.status(400).json({ error: 'At least one image URL is required' });
  }

  if (imageUrls.length > MAX_FILES) {
    return res.status(400).json({ error: `Maximum ${MAX_FILES} images allowed` });
  }

  // Validate image URLs
  for (const url of imageUrls) {
    if (typeof url !== 'string' || !isValidImageUrl(url)) {
      return res.status(400).json({ error: 'Invalid image URL provided' });
    }
  }

  next();
};

const isValidImageUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' && url.includes('cloudinary.com');
  } catch {
    return false;
  }
};