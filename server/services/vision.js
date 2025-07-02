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
      // Check if credentials are available (either file path or environment variables)
      const hasEnvCredentials = process.env.GOOGLE_CLOUD_PROJECT_ID && 
                               process.env.GOOGLE_CLOUD_PRIVATE_KEY && 
                               process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
      
      const hasFileCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;

      if (!hasEnvCredentials && !hasFileCredentials) {
        throw new Error('Google Cloud credentials not found. Set either GOOGLE_APPLICATION_CREDENTIALS or individual environment variables.');
      }

      let clientConfig = {};

      if (hasEnvCredentials) {
        // Use environment variables (for Railway deployment)
        console.log('🔑 Using Google Cloud credentials from environment variables');
        clientConfig = {
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
          credentials: {
            client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }
        };
      } else {
        // Use service account file (for local development)
        console.log(`🔑 Using credentials from: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
        clientConfig = {
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
        };
      }
      
      // Initialize client with appropriate credentials
      this.client = new vision.ImageAnnotatorClient(clientConfig);
      
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
      
      if (error.message.includes('GOOGLE_APPLICATION_CREDENTIALS') || error.message.includes('credentials')) {
        console.warn('   💡 For local development: Set GOOGLE_APPLICATION_CREDENTIALS to path of service account JSON');
        console.warn('   💡 For deployment: Set GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_CLIENT_EMAIL, and GOOGLE_CLOUD_PRIVATE_KEY');
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
    
    // Helper functions
    const getTextArea = (detection) => {
      if (!detection.boundingPoly?.vertices || detection.boundingPoly.vertices.length < 4) {
        return 0;
      }
      const vertices = detection.boundingPoly.vertices;
      const width = Math.abs(vertices[1].x - vertices[0].x);
      const height = Math.abs(vertices[2].y - vertices[1].y);
      return width * height;
    };
    
    const getYPosition = (detection) => {
      return detection.boundingPoly?.vertices?.[0]?.y || 0;
    };
    
    const getXPosition = (detection) => {
      return detection.boundingPoly?.vertices?.[0]?.x || 0;
    };
    
    const getTextHeight = (detection) => {
      if (!detection.boundingPoly?.vertices || detection.boundingPoly.vertices.length < 4) {
        return 0;
      }
      const vertices = detection.boundingPoly.vertices;
      return Math.abs(vertices[2].y - vertices[0].y);
    };
    
    // Filter and prepare text elements
    const words = textWithBounds
      .filter(text => text.description.length > 1) // Filter out single characters
      .map(text => ({
        text: text.description,
        x: getXPosition(text),
        y: getYPosition(text),
        area: getTextArea(text),
        height: getTextHeight(text),
        detection: text
      }))
      .sort((a, b) => a.y - b.y || a.x - b.x); // Sort by Y first, then X
    
    if (words.length === 0) {
      return 'Unknown Card';
    }
    
    // Group words that are on the same line (similar Y position and close together)
    const groups = this.groupWordsIntoLines(words);
    
    // Find the image height to determine "top portion"
    const maxY = Math.max(...words.map(w => w.y));
    const topThreshold = maxY * 0.3; // Top 30% of the image
    
    // Filter groups to only those in the top portion
    const topGroups = groups.filter(group => group.y <= topThreshold);
    
    if (topGroups.length === 0) {
      // Fallback to the first group (topmost)
      return this.cleanCardName(groups[0].text);
    }
    
    // Among top groups, find the largest by total area
    const largestGroup = topGroups.sort((a, b) => b.area - a.area)[0];
    
    return this.cleanCardName(largestGroup.text);
  }
  
  groupWordsIntoLines(words) {
    const groups = [];
    const used = new Set();
    
    for (let i = 0; i < words.length; i++) {
      if (used.has(i)) continue;
      
      const currentWord = words[i];
      const group = {
        text: currentWord.text,
        x: currentWord.x,
        y: currentWord.y,
        area: currentWord.area,
        height: currentWord.height,
        words: [currentWord]
      };
      
      used.add(i);
      
      // Look for words on the same line (similar Y position)
      for (let j = i + 1; j < words.length; j++) {
        if (used.has(j)) continue;
        
        const otherWord = words[j];
        
        // Check if words are on roughly the same line
        const yDifference = Math.abs(currentWord.y - otherWord.y);
        const maxHeight = Math.max(currentWord.height, otherWord.height);
        const yTolerance = maxHeight * 0.5; // Allow 50% height difference
        
        if (yDifference <= yTolerance) {
          // Check if words are close enough horizontally
          const wordsInGroup = group.words.sort((a, b) => a.x - b.x);
          const leftmostX = wordsInGroup[0].x;
          const rightmostX = wordsInGroup[wordsInGroup.length - 1].x + 
                           (wordsInGroup[wordsInGroup.length - 1].detection.boundingPoly.vertices[1].x - 
                            wordsInGroup[wordsInGroup.length - 1].detection.boundingPoly.vertices[0].x);
          
          const wordWidth = otherWord.detection.boundingPoly.vertices[1].x - otherWord.detection.boundingPoly.vertices[0].x;
          const gapTolerance = maxHeight * 1.4; // Reduced by 30%: was 2.0, now 1.4 (2.0 * 0.7)
          
          // Check if the word fits within reasonable distance of the group
          const distanceToGroup = Math.min(
            Math.abs(otherWord.x - rightmostX), // Distance to right edge
            Math.abs(leftmostX - (otherWord.x + wordWidth)) // Distance to left edge
          );
          
          if (distanceToGroup <= gapTolerance) {
            // Add word to group
            group.words.push(otherWord);
            group.area += otherWord.area;
            used.add(j);
          }
        }
      }
      
      // Construct the final text for this group
      const sortedWords = group.words.sort((a, b) => a.x - b.x);
      group.text = sortedWords.map(w => w.text).join(' ');
      
      // Update group position to be the average
      group.y = group.words.reduce((sum, w) => sum + w.y, 0) / group.words.length;
      group.x = Math.min(...group.words.map(w => w.x));
      
      groups.push(group);
    }
    
    return groups.sort((a, b) => a.y - b.y); // Sort groups by Y position
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