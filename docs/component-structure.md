# Deckie MVP Component Structure

## Overview

This document outlines the complete component structure for the Deckie MVP - a deckbuilder tool for indie TCG creators. The application uses React for the frontend, Express for the backend, PostgreSQL for the database, and Cloudinary for image storage.

## Frontend Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   └── Button.css
│   │   ├── Loading/
│   │   │   ├── Loading.jsx
│   │   │   └── Loading.css
│   │   └── ProgressBar/
│   │       ├── ProgressBar.jsx
│   │       └── ProgressBar.css
│   ├── landing/
│   │   ├── LandingPage/
│   │   │   ├── LandingPage.jsx
│   │   │   └── LandingPage.css
│   │   ├── GameNameInput/
│   │   │   ├── GameNameInput.jsx
│   │   │   └── GameNameInput.css
│   │   ├── ThemeSelector/
│   │   │   ├── ThemeSelector.jsx
│   │   │   └── ThemeSelector.css
│   │   ├── FileUpload/
│   │   │   ├── FileUpload.jsx
│   │   │   └── FileUpload.css
│   │   └── CreateDeckForm/
│   │       ├── CreateDeckForm.jsx
│   │       └── CreateDeckForm.css
│   └── deckbuilder/
│       ├── DeckbuilderPage/
│       │   ├── DeckbuilderPage.jsx
│       │   └── DeckbuilderPage.css
│       ├── Header/
│       │   ├── Header.jsx
│       │   └── Header.css
│       ├── CardsGrid/
│       │   ├── CardsGrid.jsx
│       │   └── CardsGrid.css
│       ├── Card/
│       │   ├── Card.jsx
│       │   └── Card.css
│       ├── DeckPanel/
│       │   ├── DeckPanel.jsx
│       │   └── DeckPanel.css
│       ├── DeckList/
│       │   ├── DeckList.jsx
│       │   └── DeckList.css
│       └── ExportButtons/
│           ├── ExportButtons.jsx
│           └── ExportButtons.css
├── pages/
│   ├── Landing.jsx
│   └── Deckbuilder.jsx
├── services/
│   ├── api.js
│   ├── cloudinary.js
│   └── exports.js
├── hooks/
│   ├── useDeck.js
│   └── useTheme.js
├── utils/
│   ├── constants.js
│   └── helpers.js
├── styles/
│   ├── globals.css
│   ├── themes.css
│   └── variables.css
├── App.jsx
├── App.css
└── main.jsx
```

## Backend Structure

```
server/
├── routes/
│   ├── deckie.js
│   └── health.js
├── models/
│   └── Deckie.js
├── middleware/
│   ├── cors.js
│   └── validation.js
├── services/
│   ├── database.js
│   └── cloudinary.js
├── utils/
│   ├── nanoid.js
│   └── constants.js
├── config/
│   ├── database.js
│   └── cloudinary.js
├── app.js
└── server.js
```

## Database Schema

```sql
CREATE TABLE deckies (
  id SERIAL PRIMARY KEY,
  deckie_url VARCHAR(255) UNIQUE NOT NULL,
  game_name VARCHAR(255) NOT NULL,
  theme VARCHAR(50) NOT NULL,
  image_urls TEXT[] NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Component Responsibilities

### Landing Page Components

- **`LandingPage`** - Main container component that orchestrates the deck creation flow
- **`GameNameInput`** - Handles game name input with validation
- **`ThemeSelector`** - Theme selection interface with visual previews
- **`FileUpload`** - Drag and drop file upload with progress indication
- **`CreateDeckForm`** - Form submission handling and API communication

### Deckbuilder Components

- **`DeckbuilderPage`** - Main container that fetches and manages all deck data
- **`Header`** - Displays game title and shareable URL
- **`CardsGrid`** - Responsive grid layout for displaying all available cards
- **`Card`** - Individual card component with click handlers for deck addition
- **`DeckPanel`** - Right sidebar container for deck management features
- **`DeckList`** - Current deck display with card counts and removal options
- **`ExportButtons`** - Export functionality (txt, TTS image, copy, share)

### Shared Components

- **`Button`** - Consistent button styling that adapts to themes
- **`Loading`** - Loading states and spinner components
- **`ProgressBar`** - Upload progress indication

### Services & Utilities

- **`api.js`** - All API calls to the backend server
- **`cloudinary.js`** - Image upload handling and Cloudinary integration
- **`exports.js`** - Deck export functionality for various formats
- **`useDeck.js`** - Custom hook for deck state management
- **`useTheme.js`** - Custom hook for theme application and switching

## Data Flow

### Landing Page Flow
1. User enters game name → `GameNameInput`
2. User selects theme → `ThemeSelector`
3. User uploads images → `FileUpload` → Cloudinary
4. User submits → `CreateDeckForm` → API → Database
5. Server returns unique URL → Redirect to deckbuilder

### Deckbuilder Flow
1. Page loads with deckie_url → `DeckbuilderPage`
2. Fetch deck data → `api.js` → Server → Database
3. Display cards → `CardsGrid` with `Card` components
4. User adds cards → `useDeck` hook manages state
5. Deck updates → `DeckList` displays current deck
6. Export functionality → `ExportButtons` → `exports.js`

## Design Principles

- **Single Responsibility** - Each component has one clear purpose
- **Separation of Concerns** - UI, logic, and data are properly separated
- **Reusability** - Common components can be shared across pages
- **Scalability** - Structure supports future feature additions
- **Maintainability** - Clear organization makes code easy to find and modify
- **Theme Support** - All components designed to work with multiple themes