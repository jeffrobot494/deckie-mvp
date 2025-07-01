import pool from '../config/database.js';

class Card {
  static async createMany(deckieId, imageUrls) {
    if (!imageUrls || imageUrls.length === 0) {
      throw new Error('Image URLs are required');
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Prepare bulk insert
      const values = imageUrls.map((url, index) => `($1, $${index + 2})`).join(', ');
      const query = `
        INSERT INTO cards (deckie_id, image_url)
        VALUES ${values}
        RETURNING *
      `;
      
      const params = [deckieId, ...imageUrls];
      const result = await client.query(query, params);
      
      await client.query('COMMIT');
      return result.rows;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByDeckieId(deckieId) {
    const query = `
      SELECT id, deckie_id, image_url, card_name, created_at
      FROM cards 
      WHERE deckie_id = $1 
      ORDER BY created_at ASC
    `;
    
    const result = await pool.query(query, [deckieId]);
    return result.rows;
  }

  static async findByDeckieUrl(deckieUrl) {
    const query = `
      SELECT c.id, c.deckie_id, c.image_url, c.card_name, c.created_at
      FROM cards c
      JOIN deckies d ON c.deckie_id = d.id
      WHERE d.deckie_url = $1
      ORDER BY c.created_at ASC
    `;
    
    const result = await pool.query(query, [deckieUrl]);
    return result.rows;
  }

  static async updateCardName(cardId, cardName) {
    const query = `
      UPDATE cards 
      SET card_name = $1 
      WHERE id = $2 
      RETURNING *
    `;
    
    const result = await pool.query(query, [cardName, cardId]);
    return result.rows[0];
  }

  static async getProcessingStatus(deckieId) {
    const query = `
      SELECT 
        COUNT(*) as total_cards,
        COUNT(card_name) as processed_cards,
        COUNT(*) - COUNT(card_name) as pending_cards
      FROM cards 
      WHERE deckie_id = $1
    `;
    
    const result = await pool.query(query, [deckieId]);
    const status = result.rows[0];
    
    return {
      totalCards: parseInt(status.total_cards),
      processedCards: parseInt(status.processed_cards),
      pendingCards: parseInt(status.pending_cards),
      isComplete: parseInt(status.pending_cards) === 0
    };
  }

  static async getProcessingStatusByUrl(deckieUrl) {
    const query = `
      SELECT 
        COUNT(*) as total_cards,
        COUNT(c.card_name) as processed_cards,
        COUNT(*) - COUNT(c.card_name) as pending_cards
      FROM cards c
      JOIN deckies d ON c.deckie_id = d.id
      WHERE d.deckie_url = $1
    `;
    
    const result = await pool.query(query, [deckieUrl]);
    const status = result.rows[0];
    
    return {
      totalCards: parseInt(status.total_cards),
      processedCards: parseInt(status.processed_cards),
      pendingCards: parseInt(status.pending_cards),
      isComplete: parseInt(status.pending_cards) === 0
    };
  }

  static async getPendingCards(deckieId) {
    const query = `
      SELECT id, image_url
      FROM cards 
      WHERE deckie_id = $1 AND card_name IS NULL
      ORDER BY created_at ASC
    `;
    
    const result = await pool.query(query, [deckieId]);
    return result.rows;
  }
}

export default Card;