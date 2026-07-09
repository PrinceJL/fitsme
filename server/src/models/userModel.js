import { query } from '../config/db.js';

export const UserModel = {
  async findByEmail(email) {
    const { rows } = await query(
      'SELECT id, email, password_hash, full_name, created_at FROM users WHERE email = $1',
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await query(
      'SELECT id, email, full_name, created_at FROM users WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  async create({ email, passwordHash, fullName }) {
    const { rows } = await query(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name, created_at`,
      [email, passwordHash, fullName || null]
    );
    return rows[0];
  },
};
