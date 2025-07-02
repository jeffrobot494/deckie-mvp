import pool from '../config/database.js';

class DeckImage {
  /**
   * Create a new deck image record
   * @param {number} deckieId - The ID of the deckie
   * @param {string} deckHash - Hash of the deck composition
   * @param {string} imageUrl - URL of the generated TTS image
   * @returns {Promise<Object>} The created deck image record
   */
  static async create(deckieId, deckHash, imageUrl) {
    const query = `
      INSERT INTO deck_images (deckie_id, deck_hash, image_url)
      VALUES ($1, $2, $3)
      ON CONFLICT (deckie_id, deck_hash) DO UPDATE SET
        image_url = EXCLUDED.image_url,
        created_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const values = [deckieId, deckHash, imageUrl];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find existing deck image by deckie ID and deck hash
   * @param {number} deckieId - The ID of the deckie
   * @param {string} deckHash - Hash of the deck composition
   * @returns {Promise<Object|null>} The deck image record or null if not found
   */
  static async findByDeckieAndHash(deckieId, deckHash) {
    const query = `
      SELECT * FROM deck_images 
      WHERE deckie_id = $1 AND deck_hash = $2
    `;
    const values = [deckieId, deckHash];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Get all deck images for a specific deckie
   * @param {number} deckieId - The ID of the deckie
   * @returns {Promise<Array>} Array of deck image records
   */
  static async findByDeckieId(deckieId) {
    const query = `
      SELECT * FROM deck_images 
      WHERE deckie_id = $1
      ORDER BY created_at DESC
    `;
    const values = [deckieId];
    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Delete deck images older than a certain date (for cleanup)
   * @param {Date} beforeDate - Delete images created before this date
   * @returns {Promise<number>} Number of deleted records
   */
  static async deleteOldImages(beforeDate) {
    const query = `
      DELETE FROM deck_images 
      WHERE created_at < $1
    `;
    const values = [beforeDate];
    const result = await pool.query(query, values);
    return result.rowCount;
  }
}

export default DeckImage;