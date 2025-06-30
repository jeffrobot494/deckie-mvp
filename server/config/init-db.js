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

    // Check if table exists
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'deckies'
      );
    `;
    const tableResult = await appClient.query(tableCheckQuery);

    if (!tableResult.rows[0].exists) {
      // Table doesn't exist, create it
      console.log('Creating deckies table...');
      const createTableQuery = `
        CREATE TABLE deckies (
          id SERIAL PRIMARY KEY,
          deckie_url VARCHAR(255) UNIQUE NOT NULL,
          game_name VARCHAR(255) NOT NULL,
          theme VARCHAR(50) NOT NULL,
          image_urls TEXT[] NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await appClient.query(createTableQuery);
      console.log('✅ Table created successfully');
    } else {
      console.log('✅ Table already exists');
    }

    await appClient.end();
    console.log('🚀 Database initialization complete!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('Please check your database connection settings in .env file');
    process.exit(1);
  }
}

export default initializeDatabase;