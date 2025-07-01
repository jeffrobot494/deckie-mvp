# Deckie MVP - Developer Guide

## Overview

Deckie is a web application that allows indie TCG creators to quickly build and share deckbuilder tools for their trading card games. Users can upload card images, choose a theme, and get a shareable deckbuilder page in under 5 minutes. The application uses Google Cloud Vision API to automatically extract card names from uploaded images.

## Architecture

### Technology Stack
- **Frontend**: React 18 with Vite, React Router, Context API
- **Backend**: Express.js with Node.js
- **Database**: PostgreSQL
- **Image Storage**: Cloudinary
- **OCR**: Google Cloud Vision API
- **Deployment**: Designed for Railway (currently running locally)

### High-Level Data Flow

1. **Upload Flow**: User uploads images → Cloudinary → Database → Background Vision API processing
2. **Deckbuilder Flow**: User accesses deckbuilder → Fetch cards → Display with real/placeholder names
3. **Deck Management**: Add/remove cards → Local state → Export functionality

## Project Structure

```
deckie-mvp/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── context/           # Context providers
│   │   ├── pages/             # Page components
│   │   ├── services/          # API and external services
│   │   └── styles/            # Global CSS and themes
├── server/                    # Express backend
│   ├── config/               # Database and service configuration
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── services/             # Business logic services
│   ├── middleware/           # Express middleware
│   └── utils/                # Utility functions
├── docs/                     # Documentation
└── .env                      # Environment variables
```

## Database Schema

### Tables

#### `deckies`
Stores basic deckbuilder information.
```sql
CREATE TABLE deckies (
  id SERIAL PRIMARY KEY,
  deckie_url VARCHAR(255) UNIQUE NOT NULL,  -- Unique URL identifier (nanoid)
  game_name VARCHAR(255) NOT NULL,          -- User-provided game name
  theme VARCHAR(50) NOT NULL,               -- light, dark, or neon
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `cards` 
Stores individual card data linked to deckbuilders.
```sql
CREATE TABLE cards (
  id SERIAL PRIMARY KEY,
  deckie_id INTEGER NOT NULL REFERENCES deckies(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,                  -- Cloudinary URL
  card_name TEXT,                           -- NULL until Vision API processes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Backend Architecture

### Core Services

#### `services/vision.js`
**Purpose**: Google Cloud Vision API integration for card name extraction.

**Key Features**:
- Graceful initialization (works even if credentials are missing)
- Uses heuristic to find card names: largest text in top 30% of image
- Fallback to filename-based names if Vision API fails
- Error handling prevents server crashes

**Configuration**: Requires `GOOGLE_APPLICATION_CREDENTIALS` pointing to service account JSON file.

#### `services/cardProcessor.js`
**Purpose**: Background processing orchestrator for Vision API.

**Key Features**:
- Processes cards asynchronously after upload
- Prevents duplicate processing with in-memory queue
- Individual card error handling (one failure doesn't stop others)
- Emergency fallback names if everything fails

**Flow**:
1. Triggered after deckbuilder creation
2. Fetches pending cards (`card_name IS NULL`)
3. Processes each card with Vision API
4. Updates database with extracted names

#### `config/init-db.js`
**Purpose**: Database initialization and schema management.

**Features**:
- Creates database if it doesn't exist
- Creates tables with proper relationships
- Creates indexes for performance
- Safe to run multiple times

### API Endpoints

#### Deckbuilder Routes (`/api/deckie`)

**POST `/api/deckie`**
- Creates new deckbuilder
- Validates input (game name, theme, image URLs)
- Creates cards in database
- Triggers background Vision API processing
- Returns unique `deckieUrl`

**GET `/api/deckie/:deckieUrl`**
- Returns basic deckbuilder info (name, theme)
- Used by frontend to initialize deckbuilder page

#### Cards Routes (`/api/cards`)

**GET `/api/cards/:deckieUrl`**
- Returns all cards for a deckbuilder
- Includes processing status for each card
- Provides placeholder names for unprocessed cards

**GET `/api/cards/:deckieUrl/status`**
- Returns processing progress (processed/total cards)
- Used for progress bar updates
- Indicates when processing is complete

### Models

#### `models/Deckie.js`
- `create()`: Insert new deckbuilder
- `findByUrl()`: Get deckbuilder by URL
- `getAll()`: List all deckbuilders

#### `models/Card.js`
- `createMany()`: Bulk insert cards for a deckbuilder
- `findByDeckieUrl()`: Get all cards for a deckbuilder
- `updateCardName()`: Update card name after Vision API processing
- `getProcessingStatus()`: Get processing statistics
- `getPendingCards()`: Get unprocessed cards

### Middleware

#### `middleware/validation.js`
**Purpose**: Input validation for API endpoints.

**Validates**:
- Game name (required, max 255 chars)
- Theme (must be 'light', 'dark', or 'neon')
- Image URLs (array, max 250 files, must be valid Cloudinary URLs)

## Frontend Architecture

### State Management

#### Context API
- **DeckContext**: Manages deck building state (card counts, add/remove)
- **ThemeContext**: Manages theme switching and application

#### Custom Hooks
- `useDeck()`: Access deck building functionality
- `useTheme()`: Access theme switching

### Pages

#### `pages/Landing.jsx`
**Purpose**: Upload and configuration page.

**Features**:
- Game name input with validation
- Theme selection (3 options with previews)
- Drag & drop file upload with progress
- Cloudinary integration for image uploads
- Form validation and error handling

**Flow**:
1. User enters game details
2. Selects and uploads images to Cloudinary
3. Submits to backend API
4. Redirects to deckbuilder page

#### `pages/Deckbuilder.jsx`
**Purpose**: Main deckbuilder interface.

**Features**:
- Displays all uploaded cards in responsive grid
- Shows processing progress bar during Vision API extraction
- Real-time deck building with add/remove functionality
- Export options (text, copy, share)
- Handles Vision API completion notifications

**State Management**:
- Fetches deckbuilder data on load
- Polls for processing status updates
- Manages card display and interaction

### Components

#### Shared Components (`components/common/`)

**Button**: Consistent button styling across themes
- Props: `variant`, `onClick`, `disabled`, `className`
- Supports primary, secondary, danger variants

**Loading**: Loading states with configurable size
- Props: `message`, `size` (small/medium/large)
- Animated spinner with theme colors

**ProgressBar**: Upload and processing progress
- Props: `progress` (0-100), `message`, `className`
- Used for file uploads and Vision API processing

#### Landing Page Components (`components/landing/`)

**ThemeSelector**: Theme choice interface
- Visual previews of each theme
- Updates global theme context
- Supports light, dark, neon themes

**FileUpload**: Drag & drop file upload
- Supports drag/drop and click-to-select
- File validation (type, size, count)
- Visual feedback for file selection
- Integrates with Cloudinary service

#### Deckbuilder Components (`components/deckbuilder/`)

**Header**: Game title and shareable URL display
- Shows game name and current deckbuilder URL
- Responsive design for mobile

**CardsGrid**: Responsive grid of all cards
- Displays cards from API data
- Handles empty states
- Responsive column layout

**Card**: Individual card component
- Displays card image and name overlay
- Click handler for adding to deck
- Fallback display for missing images

**DeckPanel**: Right sidebar for deck management
- Shows current deck with card counts
- Add/remove functionality
- Export buttons and options

**DeckList**: Current deck display
- Shows cards with quantities (e.g., "2x Lightning Bolt")
- Remove buttons for each card
- Empty state when no cards in deck

**ExportButtons**: Deck export functionality
- Export as text file download
- Copy deck list to clipboard
- Share deckbuilder URL
- TTS (Tabletop Simulator) image export (placeholder)

### Services

#### `services/api.js`
**Purpose**: All backend API communication.

**Methods**:
- `createDeckie()`: Create new deckbuilder
- `getDeckie()`: Get deckbuilder info
- `getCards()`: Get cards for deckbuilder
- `getCardsStatus()`: Get processing status
- `healthCheck()`: Server health check

#### `services/cloudinary.js`
**Purpose**: Client-side image upload to Cloudinary.

**Features**:
- Direct upload from browser to Cloudinary
- File validation (type, size, dimensions)
- Progress callbacks for upload tracking
- Uses unsigned upload presets for security

**Configuration**: Requires `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET`.

### Styling System

#### CSS Architecture
- **Global styles**: `styles/globals.css` - Reset, base styles
- **CSS Variables**: `styles/variables.css` - Theme system
- **Component styles**: Co-located with components

#### Theme System
Three built-in themes using CSS custom properties:
- **Light**: Clean, professional appearance
- **Dark**: Modern dark mode
- **Neon**: Cyberpunk aesthetic with bright colors

**Implementation**: Themes switch by changing `data-theme` attribute on `<html>` element.

## Configuration

### Environment Variables

#### Backend (`.env`)
```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/deckie_mvp
DB_HOST=localhost
DB_PORT=5432
DB_NAME=deckie_mvp
DB_USER=postgres
DB_PASSWORD=password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Google Cloud Vision API
GOOGLE_APPLICATION_CREDENTIALS=./config/service-account.json

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# File Upload Limits
MAX_FILE_SIZE=10485760          # 10MB
MAX_FILES_PER_UPLOAD=250
MAX_TOTAL_UPLOAD_SIZE=524288000 # 500MB
MIN_IMAGE_WIDTH=200
MIN_IMAGE_HEIGHT=280
MAX_IMAGE_WIDTH=2000
MAX_IMAGE_HEIGHT=2800

# URL Generation
NANOID_LENGTH=12
NANOID_ALPHABET=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-

# Security
API_RATE_LIMIT=100
```

#### Frontend (`client/.env`)
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### External Service Setup

#### Cloudinary Configuration
1. Create account at cloudinary.com
2. Create unsigned upload preset named as specified in env vars
3. Set folder to `deckie-cards` (optional)
4. Configure allowed file types (PNG, JPG)

#### Google Cloud Vision API Setup
1. Create Google Cloud project
2. Enable Vision API
3. Create service account with Vision API permissions
4. Download service account JSON key
5. Place key file at path specified in `GOOGLE_APPLICATION_CREDENTIALS`

## Development Workflow

### Getting Started

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Set up environment variables**: Copy and configure `.env` files

3. **Set up external services**: Configure Cloudinary and Google Cloud

4. **Start development servers**:
   ```bash
   npm run dev  # Starts both frontend and backend
   ```

### Database Management

**Initial setup**: Database and tables are created automatically on first server start.

**Reset database**: If you need to start fresh:
1. Drop database manually in PostgreSQL
2. Restart server (will recreate automatically)

### Testing Vision API

Use the standalone test in `vision-test/` directory:
```bash
cd vision-test
npm install
# Place test card image as test-image.png
npm test
```

### Common Development Tasks

#### Adding New Themes
1. Add theme colors to `styles/variables.css`
2. Update theme list in `ThemeSelector.jsx`
3. Add theme validation in backend validation middleware

#### Modifying Card Name Extraction
1. Update heuristic in `services/vision.js`
2. Test with various card images using vision-test
3. Consider fallback behavior for edge cases

#### Adding Export Formats
1. Extend `ExportButtons.jsx` with new export option
2. Add export logic to `DeckContext.jsx`
3. Consider server-side generation for complex formats

## Security Considerations

### API Security
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS configuration for frontend origin
- Helmet.js for security headers

### File Upload Security
- Client-side file type validation
- Size limits enforced
- Direct upload to Cloudinary (no server storage)
- Unsigned upload presets (no API keys in frontend)

### Credential Management
- Service account keys in gitignore
- Environment variables for sensitive data
- No database credentials in code

## Performance Considerations

### Frontend
- Lazy loading for card images
- React component optimization
- CSS-only animations
- Responsive image sizing

### Backend
- Database indexes on frequently queried columns
- Background processing for Vision API
- Connection pooling for database
- Efficient bulk operations

### Vision API
- Processes cards individually (prevents timeout issues)
- Graceful fallback if API unavailable
- Error handling prevents processing queue blockage

## Troubleshooting

### Common Issues

#### "Connection Refused" Errors
- Check if backend server is running on port 3000
- Verify CORS configuration allows frontend origin
- Check for server crashes in logs

#### Vision API Not Working
- Verify `GOOGLE_APPLICATION_CREDENTIALS` path is correct
- Check service account has Vision API permissions
- Ensure Vision API is enabled in Google Cloud project
- Check server logs for detailed error messages

#### Upload Failures
- Verify Cloudinary credentials in environment variables
- Check upload preset exists and is unsigned
- Verify file types and sizes meet requirements

#### Database Connection Issues
- Check PostgreSQL is running
- Verify database credentials in .env
- Check if database exists (created automatically on first run)

### Debugging Tips

#### Backend Debugging
- Check server logs for detailed error messages
- Use `/api/health` endpoint to verify server status
- Monitor database queries for performance issues

#### Frontend Debugging
- Use browser dev tools to inspect API calls
- Check console for JavaScript errors
- Verify environment variables are loaded (prefixed with VITE_)

#### Vision API Debugging
- Use vision-test project to isolate Vision API issues
- Check Google Cloud Console for API quotas and billing
- Monitor server logs for Vision API initialization messages

## Future Enhancement Ideas

### Features
- User accounts and authentication
- Multiple deckbuilders per user
- Advanced card filtering and search
- Custom card categories/types
- Deck validation rules
- Community sharing features

### Technical Improvements
- Redis caching for frequently accessed data
- WebSocket updates for real-time processing status
- Image optimization and CDN integration
- Advanced OCR with custom training
- Bulk card management interface

### Deployment
- Docker containerization
- CI/CD pipeline setup
- Production environment configuration
- Monitoring and logging setup
- Database backup and recovery procedures

## API Reference

### Response Formats

#### Success Response
```json
{
  "data": "response_data",
  "message": "Success message"
}
```

#### Error Response
```json
{
  "error": "Error description"
}
```

### Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `404`: Not Found
- `500`: Internal Server Error

### Rate Limiting
- 100 requests per 15 minutes per IP
- Applies to all `/api/*` endpoints
- Returns 429 status when exceeded

---

This guide provides a comprehensive overview of the Deckie MVP application architecture and implementation details. For specific implementation questions, refer to the code comments and existing patterns in the codebase.