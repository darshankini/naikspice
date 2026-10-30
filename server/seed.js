// Seeds an admin user and a few sample products. Safe to run multiple times.
const bcrypt = require('bcryptjs');
const pool = require('./db');

// [category, name, price per kg]. Images are left empty; upload real photos from the dashboard.
const SAMPLE_PRODUCTS = [
  ['Whole Spices',  'Black Pepper',           900],
  ['Whole Spices',  'Green Cardamom',        3200],
  ['Whole Spices',  'Cloves',                1400],
  ['Whole Spices',  'Cinnamon Sticks',        600],
  ['Whole Spices',  'Cumin Seeds',            500],
  ['Ground Spices', 'Turmeric Powder',        300],
  ['Ground Spices', 'Kashmiri Chilli Powder', 650],
  ['Ground Spices', 'Coriander Powder',       280],
  ['Masala Blends', 'Garam Masala',           900],
  ['Masala Blends', 'Fish Curry Masala',      800],
  ['Masala Blends', 'Chicken Masala',         800],
  ['Dry Fruits',    'Badam (Almonds)',       1000],
  ['Dry Fruits',    'Cashew Nuts',           1200],
];

(async () => {
  try {
    // Admin user
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO users (username, password, name) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE password = VALUES(password)`,
      ['admin', hash, 'Administrator']
    );

    // Map category names -> ids
    const [cats] = await pool.query('SELECT id, name FROM categories');
    const byName = Object.fromEntries(cats.map((c) => [c.name, c.id]));

    for (const [cat, name, price] of SAMPLE_PRODUCTS) {
      const [exists] = await pool.query('SELECT id FROM products WHERE name = ?', [name]);
      if (exists.length) continue;
      await pool.query(
        'INSERT INTO products (category_id, name, price) VALUES (?, ?, ?)',
        [byName[cat] || null, name, price]
      );
    }

    console.log('✔ Seeded admin (admin / admin123) and sample products.');
  } catch (e) {
    console.error('Seed failed:', e.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
