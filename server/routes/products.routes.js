const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const pool = require('../db');
const { requireAuth } = require('../auth');

// --- Image uploads ---------------------------------------------------------
// Files are stored on disk under server/uploads and served statically from
// /uploads (see index.js). The product row keeps an absolute URL to the file.
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    cb(null, `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) =>
    /^image\//.test(file.mimetype) ? cb(null, true) : cb(new Error('Only image files are allowed')),
});

// Public list with optional ?category=<id> filter (used by the POS screen).
router.get('/', async (req, res) => {
  const { category } = req.query;

  const params = [];

  let sql = `
    SELECT
      p.id,
      p.name,
      p.price,
      p.image,
      p.category_id,
      c.name AS category
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.is_active = 1
  `;

  if (category) {
    sql += ' AND p.category_id = ?';
    params.push(category);
  }

  sql += ' ORDER BY p.name';

  const result = await pool.query(sql, params);

  res.json(result[0]);
});

// CRUD below requires auth.
router.use(requireAuth);

// POST /api/products/upload  (multipart, field name: "image")
// Saves the uploaded image and returns its absolute URL to store on the product.
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no image file' });
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(201).json({ url, filename: req.file.filename });
});

router.post('/', async (req, res) => {
  const { name, price, category_id, image } = req.body || {};

  if (!name || price == null) {
    return res.status(400).json({
      error: 'name and price required'
    });
  }

  const result = await pool.query(
    `INSERT INTO products
      (name, price, category_id, image)
     VALUES (?, ?, ?, ?)`,
    [
      name,
      price,
      category_id || null,
      image || null
    ]
  );

  

  res.status(201).json({
    id: result[0].insertId,
    name,
    price,
    category_id: category_id || null,
    image: image || null
  });
});

router.put('/:id', async (req, res) => {
  const { name, price, category_id, image } = req.body || {};

  await pool.query(
    `UPDATE products
     SET name = ?,
         price = ?,
         category_id = ?,
         image = ?
     WHERE id = ?`,
    [
      name,
      price,
      category_id || null,
      image || null,
      req.params.id
    ]
  );

  res.json({
    id: Number(req.params.id),
    name,
    price,
    category_id: category_id || null,
    image: image || null
  });
});

router.delete('/:id', async (req, res) => {
  await pool.query(
    'DELETE FROM products WHERE id = ?',
    [req.params.id]
  );

  res.json({ ok: true });
});

module.exports = router;