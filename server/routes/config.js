import express from 'express';

const router = express.Router();

// Endpoint to provide client configuration
router.get('/', (req, res) => {
  // Only provide non-sensitive config to client
  const clientConfig = {
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || process.env.VITE_CLOUDINARY_UPLOAD_PRESET
    }
  };

  // Debug logging on server
  console.log('Config endpoint called');
  console.log('Available env vars:', {
    CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
    VITE_CLOUDINARY_CLOUD_NAME: !!process.env.VITE_CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET: !!process.env.CLOUDINARY_UPLOAD_PRESET,
    VITE_CLOUDINARY_UPLOAD_PRESET: !!process.env.VITE_CLOUDINARY_UPLOAD_PRESET
  });
  console.log('Sending config:', clientConfig);

  res.json(clientConfig);
});

export default router;