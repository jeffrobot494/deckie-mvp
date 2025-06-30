import app from './app.js';
import initializeDatabase from './config/init-db.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Then start the server
    app.listen(PORT, () => {
      console.log(`🚀 Deckie server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();