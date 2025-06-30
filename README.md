# Deckie MVP - TCG Deckbuilder Tool

A web application for creating beautiful, functional deckbuilding tools for indie trading card games in under 5 minutes.

## Features

- **Landing Page**: Upload cards, choose themes, and configure your game
- **Deckbuilder Page**: Interactive card grid with deck management
- **Three Themes**: Light, Dark, and Neon styling options
- **Export Options**: Text files, TTS images, copy to clipboard, and shareable URLs
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, Vite, React Router
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL
- **Image Storage**: Cloudinary
- **Styling**: CSS with CSS Variables for theming

## Quick Start

1. **Setup Database**: Follow instructions in `docs/database-setup.md`

2. **Install Dependencies**:
   ```bash
   npm run install:all
   ```

3. **Start Development Servers**:
   ```bash
   npm run dev
   ```

4. **Access Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Project Structure

```
deckie-mvp/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # Context providers
│   │   ├── pages/         # Page components
│   │   ├── services/      # API and external services
│   │   └── styles/        # Global CSS and themes
├── server/                # Express backend
│   ├── config/           # Database configuration
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   └── utils/            # Utility functions
└── docs/                 # Documentation
```

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build frontend for production
- `npm run start` - Start backend in production mode
- `npm run install:all` - Install dependencies for all packages

## Environment Configuration

The application uses environment variables defined in `.env`:

- Database connection settings
- Cloudinary credentials
- File upload limits
- Security settings

## API Endpoints

- `POST /api/deckie` - Create new deckbuilder
- `GET /api/deckie/:deckieUrl` - Get deckbuilder data
- `GET /api/health` - Health check

## Data Flow

### Landing Page
1. User enters game name and selects theme
2. User uploads card images
3. Images are uploaded to Cloudinary
4. Deckbuilder is created and saved to database
5. User is redirected to their deckbuilder

### Deckbuilder Page
1. Fetch deckbuilder data by URL
2. Display cards in responsive grid
3. Allow adding/removing cards from deck
4. Provide export and sharing options

## File Upload Validation

- **Supported formats**: PNG, JPG, JPEG
- **Max file size**: 10MB per image
- **Max files**: 250 images per upload
- **Max total size**: 500MB per upload
- **Image dimensions**: 200x280px to 2000x2800px

## Themes

Three built-in themes with CSS variables:

- **Light**: Clean and professional
- **Dark**: Modern dark mode
- **Neon**: Cyberpunk aesthetic

## Contributing

1. Follow the existing code structure
2. Use the established naming conventions
3. Add CSS files alongside components
4. Update documentation as needed

## License

ISC