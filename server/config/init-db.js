import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

async function initializeDatabase() {
  // First connect to postgres database to check if our database exists
  const adminClient = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: 'postgres', // Connect to default postgres database first
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await adminClient.connect();
    console.log('Connected to PostgreSQL server');

    // Check if database exists
    const dbCheckQuery = `
      SELECT 1 FROM pg_database WHERE datname = $1
    `;
    const dbResult = await adminClient.query(dbCheckQuery, [process.env.DB_NAME]);

    if (dbResult.rows.length === 0) {
      // Database doesn't exist, create it
      console.log(`Creating database: ${process.env.DB_NAME}`);
      await adminClient.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log('✅ Database created successfully');
    } else {
      console.log('✅ Database already exists');
    }

    await adminClient.end();

    // Now connect to our actual database to create tables
    const appClient = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    await appClient.connect();

    // Create tables (using IF NOT EXISTS for safety)
    console.log('Creating database tables...');
    
    // Create deckies table
    const createDeckiesQuery = `
      CREATE TABLE IF NOT EXISTS deckies (
        id SERIAL PRIMARY KEY,
        deckie_url VARCHAR(255) UNIQUE NOT NULL,
        game_name VARCHAR(255) NOT NULL,
        theme VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await appClient.query(createDeckiesQuery);
    console.log('✅ Deckies table ready');

    // Create cards table
    const createCardsQuery = `
      CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        deckie_id INTEGER NOT NULL REFERENCES deckies(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        card_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await appClient.query(createCardsQuery);
    console.log('✅ Cards table ready');

    // Create deck_images table
    const createDeckImagesQuery = `
      CREATE TABLE IF NOT EXISTS deck_images (
        id SERIAL PRIMARY KEY,
        deckie_id INTEGER NOT NULL REFERENCES deckies(id) ON DELETE CASCADE,
        deck_hash VARCHAR(255) NOT NULL,
        image_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(deckie_id, deck_hash)
      );
    `;
    await appClient.query(createDeckImagesQuery);
    console.log('✅ Deck images table ready');

    // Create indexes for better performance
    const createIndexesQuery = `
      CREATE INDEX IF NOT EXISTS idx_cards_deckie_id ON cards(deckie_id);
      CREATE INDEX IF NOT EXISTS idx_deck_images_deckie_id ON deck_images(deckie_id);
    `;
    await appClient.query(createIndexesQuery);
    console.log('✅ Database indexes ready');

    await appClient.end();
    console.log('🚀 Database initialization complete!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('Please check your database connection settings in .env file');
    process.exit(1);
  }
}

export default initializeDatabase;