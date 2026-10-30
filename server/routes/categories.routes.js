const router = require('express').Router();
const pool = require('../db');
const { requireAuth } = require('../auth');

// Public list (used by the POS screen)
router.get('/', async (_req, res) => {
  const result = await pool.query(
    'SELECT id, name FROM categories ORDER BY name'
  );
  
  res.json(result[0]);
});

// Everything below requires auth (dashboard CRUD)
router.use(requireAuth);

router.post('/', async (req, res) => {
  const { name } = req.body || {};

  if (!name) {
    return res.status(400).json({ error: 'name required' });
  }

  const result = await pool.query(
    'INSERT INTO categories (name) VALUES (?)',
    [name]
  );

  res.status(201).json({
    id: result[0].insertId,
    name
  });
});

router.put('/:id', async (req, res) => {
  const { name } = req.body || {};

  if (!name) {
    return res.status(400).json({ error: 'name required' });
  }

  await pool.query(
    'UPDATE categories SET name = ? WHERE id = ?',
    [name, req.params.id]
  );

  res.json({
    id: Number(req.params.id),
    name
  });
});

router.delete('/:id', async (req, res) => {
  await pool.query(
    'DELETE FROM categories WHERE id = ?',
    [req.params.id]
  );

  res.json({ ok: true });
});

module.exports = router;