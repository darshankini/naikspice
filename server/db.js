const mysql = require('mysql2/promise');
require('dotenv').config();

// Single shared pool, reused across requests.
// DATABASE_URL (mysql://user:pass@host:3306/db) wins if set; otherwise the DB_* vars are used.
const options = {
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true, // DECIMAL columns / SUM() -> JS number instead of string
};

const pool = process.env.DATABASE_URL && /^mysql:\/\//.test(process.env.DATABASE_URL)
  ? mysql.createPool({ uri: process.env.DATABASE_URL, ...options })
  : mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'naikspice',
      ...options,
    });

// Returns [rows] so `const [rows] = await query(...)` works.
// For INSERT/UPDATE/DELETE, rows is mysql2's result header ({ insertId, affectedRows }).
async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return [rows];
}

module.exports = {
  query,
  pool,               // raw mysql2 pool (use pool.getConnection() for transactions)
  end: () => pool.end(),
};
