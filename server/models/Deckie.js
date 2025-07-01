import pool from '../config/database.js';

class Deckie {
  static async create({ deckieUrl, gameName, theme }) {
    const query = `
      INSERT INTO deckies (deckie_url, game_name, theme)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [deckieUrl, gameName, theme];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUrl(deckieUrl) {
    const query = 'SELECT * FROM deckies WHERE deckie_url = $1';
    const result = await pool.query(query, [deckieUrl]);
    return result.rows[0];
  }

  static async getAll() {
    const query = 'SELECT * FROM deckies ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }
}

export default Deckie;