import vision from '@google-cloud/vision';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

class VisionService {
  constructor() {
    this.client = null;
    this.isAvailable = false;
    this.initializeClient();
  }

  async initializeClient() {
    try {
      // Check if credentials are available
      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
      }

      console.log(`🔑 Using credentials from: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
      
      // Initialize client with explicit credentials path
      this.client = new vision.ImageAnnotatorClient({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
      });
      
      // Test the client by checking credentials
      const projectId = await this.client.getProjectId();
      this.isAvailable = true;
      console.log(`✅ Google Cloud Vision API initialized successfully (Project: ${projectId})`);
    } catch (error) {
      this.isAvailable = false;
      console.error('❌ Google Cloud Vision API initialization failed:');
      console.error('   Error:', error.message);
      console.error('   Stack:', error.stack);
      console.warn('   Cards will use fallback names instead of Vision API extraction');
      
      if (error.message.includes('GOOGLE_APPLICATION_CREDENTIALS') || error.message.includes('ENOENT')) {
        console.warn('   💡 Put your service account JSON file at: ./server/config/deckie-mvp-0d0f328d42f4.json');
      }
      
      if (error.code) {
        console.error('   Error Code:', error.code);
      }
    }
  }

  async extractCardName(imageUrl) {
    // If Vision API is not available, use fallback immediately
    if (!this.isAvailable) {
      console.log(`⚠️  Vision API unavailable, using fallback for: ${imageUrl}`);
      return this.generateFallbackName(imageUrl);
    }

    try {
      console.log(`🔍 Processing image with Vision API: ${imageUrl}`);

      // Prepare the request
      const request = {
        image: {
          source: {
            imageUri: imageUrl
          }
        },
        features: [
          {
            type: 'TEXT_DETECTION',
            maxResults: 50
          }
        ]
      };

      // Call Vision API
      const [result] = await this.client.annotateImage(request);
      const detections = result.textAnnotations;

      if (!detections || detections.length === 0) {
        console.log(`❌ No text detected in ${imageUrl}`);
        return this.generateFallbackName(imageUrl);
      }

      // Extract card name using the same heuristic from vision-test
      const cardName = this.extractCardNameFromDetections(detections);
      console.log(`✅ Extracted card name: "${cardName}" from ${imageUrl}`);
      
      return cardName;

    } catch (error) {
      console.error(`❌ Vision API error for ${imageUrl}:`, error.message);
      return this.generateFallbackName(imageUrl);
    }
  }

  extractCardNameFromDetections(detections) {
    // Skip the first detection (full text) and get individual words
    const textWithBounds = detections.slice(1);
    
    // Helper function to calculate text area (size)
    const getTextArea = (detection) => {
      if (!detection.boundingPoly?.vertices || detection.boundingPoly.vertices.length < 4) {
        return 0;
      }
      const vertices = detection.boundingPoly.vertices;
      const width = Math.abs(vertices[1].x - vertices[0].x);
      const height = Math.abs(vertices[2].y - vertices[1].y);
      return width * height;
    };
    
    // Helper function to get Y position
    const getYPosition = (detection) => {
      return detection.boundingPoly?.vertices?.[0]?.y || 0;
    };
    
    // Filter and analyze text
    const analyzedText = textWithBounds
      .filter(text => text.description.length > 2) // Filter out single characters
      .map(text => ({
        text: text.description,
        y: getYPosition(text),
        area: getTextArea(text),
        detection: text
      }))
      .sort((a, b) => a.y - b.y); // Sort by Y position first
    
    if (analyzedText.length === 0) {
      return 'Unknown Card';
    }
    
    // Find the image height to determine "top portion"
    const maxY = Math.max(...analyzedText.map(t => t.y));
    const topThreshold = maxY * 0.3; // Top 30% of the image
    
    // Filter to only text in the top portion
    const topText = analyzedText.filter(t => t.y <= topThreshold);
    
    if (topText.length === 0) {
      // Fallback to topmost text
      return this.cleanCardName(analyzedText[0].text);
    }
    
    // Among top text, find the largest by area
    const largestTopText = topText.sort((a, b) => b.area - a.area)[0];
    
    return this.cleanCardName(largestTopText.text);
  }

  cleanCardName(rawName) {
    // Clean up the extracted text
    return rawName
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .substring(0, 100) // Limit length
      || 'Unknown Card';
  }

  generateFallbackName(imageUrl) {
    // Extract filename from URL as fallback
    try {
      const urlParts = imageUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const nameWithoutExtension = filename.split('.')[0];
      return nameWithoutExtension
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .substring(0, 100)
        || 'Unknown Card';
    } catch (error) {
      return 'Unknown Card';
    }
  }
}

export default new VisionService();