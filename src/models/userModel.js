const pool = require("../config/db");

const User = {
  async getAll() {
    const result = await pool.query(
      "SELECT * FROM users ORDER BY created_at DESC"
    );
    return result.rows;
  },
  async getById(id) {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
  },
  async create({
    name,
    apellido1,
    apellido2,
    username,
    email,
    password,
    role = "usuario",
    institucion = null,
  }) {
    const result = await pool.query(
      "INSERT INTO users (name, apellido1, apellido2, username, email, password, role, institucion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [name, apellido1, apellido2, username, email, password, role, institucion]
    );
    return result.rows[0];
  },

  async findByUsername(username) {
    const result = await pool.query(
      "SELECT * FROM users WHERE LOWER(username) = LOWER($1)",
      [username]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  },

  async update(id, userData) {
    const { name, email } = userData;
    const result = await pool.query(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
      [name, email, id]
    );
    return result.rows[0];
  },
};

module.exports = User;
