// Creates the database (if missing) then runs schema.sql against it.
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const base = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};
const dbName = process.env.DB_NAME || 'naikspice';

(async () => {
  try {
    const c = await mysql.createConnection({ ...base, multipleStatements: true });

    // 1) Create the database if it doesn't exist. Shared hosting users usually
    //    can't create databases, so fall through if it was made in the control panel.
    try {
      await c.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4`);
      console.log(`✔ Database "${dbName}" ready.`);
    } catch (e) {
      console.log(`• Could not create database (${e.code}); assuming "${dbName}" already exists.`);
    }

    // 2) Run the table DDL on the target database.
    await c.changeUser({ database: dbName });
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await c.query(sql);
    await c.end();
    console.log('✔ Tables created.');
  } catch (e) {
    console.error('Migration failed:', e.message);
    process.exitCode = 1;
  }
})();
