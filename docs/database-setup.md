# Database Setup Instructions

## Automatic Database Setup ✨

**Good news!** The database and tables are now created automatically when you start the server. No manual setup required!

When you run `npm run dev`, the server will:
1. Check if the `deckie_mvp` database exists
2. Create it if it doesn't exist
3. Check if the `deckies` table exists  
4. Create it if it doesn't exist
5. Start the server

## Manual Setup (Optional)

If you prefer to set up the database manually or want to verify the setup, you can run these commands in PostgreSQL:

### 1. Create the Database

```sql
CREATE DATABASE deckie_mvp;
```

### 2. Connect to the Database

```sql
\c deckie_mvp
```

### 3. Create the Deckies Table

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

## Cloudinary Setup

Before running the application, you'll also need to create an upload preset in Cloudinary:

1. Go to https://cloudinary.com and sign in to your account (dmfjx6e7z)
2. Navigate to Settings → Upload
3. Scroll down to "Upload presets"
4. Click "Add upload preset"
5. Set the preset name to: `deckie_uploads`
6. Set the signing mode to: "Unsigned"
7. Set the folder to: `deckie-cards` (optional but recommended)
8. Save the preset

## Environment Variables

The `.env` file has been created with your credentials. Make sure these match your PostgreSQL setup:

- Database connection should work with `localhost:5432`
- Username: `postgres`
- Password: `passgres`
- Database: `deckie_mvp`

## Next Steps

After setting up the database and Cloudinary preset, you can start the application with:

```bash
npm run install:all
npm run dev
```

This will:
1. Install all dependencies for both frontend and backend
2. Start the backend server on port 3000
3. Start the frontend development server on port 5173

The application will be available at http://localhost:5173