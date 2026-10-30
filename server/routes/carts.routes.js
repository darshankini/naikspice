const router = require('express').Router();
const db = require('../db');
const { lineTotal } = require('../pricing');

// GET /api/carts
// Returns all open carts with display-ready items (name/image joined from products):
// [ { cart_id, items: [{ id, name, price, image, grams }] } ]
router.get('/', async (_req, res) => {
  const [carts] = await db.query('SELECT id, cart_id FROM cart ORDER BY id');
  if (!carts.length) return res.json([]);

  const ids = carts.map((c) => c.id);
  const [items] = await db.query(
    `SELECT ci.cart_id AS cref, ci.product_id AS id, p.name, ci.price, p.image, ci.grams
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id IN (?)
     ORDER BY ci.id`,
    [ids]
  );

  const byCart = {};
  for (const it of items) {
    (byCart[it.cref] = byCart[it.cref] || []).push({
      id: it.id,
      name: it.name,
      price: Number(it.price),
      image: it.image,
      grams: it.grams,
    });
  }

  res.json(carts.map((c) => ({ cart_id: c.cart_id, items: byCart[c.id] || [] })));
});

// PUT /api/carts
// Full-state sync. Body: { carts: [{ cart_id, items: [{ id, price, grams }] }] }.
// Replaces every stored cart in one transaction so the DB always mirrors the client.
router.put('/', async (req, res) => {
  const carts = Array.isArray(req.body?.carts) ? req.body.carts : [];

  
  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM cart_items');
    await conn.query('DELETE FROM cart');

    for (const c of carts) {
      const list = Array.isArray(c.items) ? c.items : [];
      const total = list.reduce((s, i) => s + lineTotal(i.price, i.grams), 0);
      const itemCount = list.length;

      const [r] = await conn.query(
        'INSERT INTO cart (cart_id, cart_total, item_count) VALUES (?, ?, ?)',
        [String(c.cart_id), total, itemCount]
      );
      const cid = r.insertId;


      for (const it of list) {
        await conn.query(
          'INSERT INTO cart_items (cart_id, product_id, price, grams) VALUES (?, ?, ?, ?)',
          [cid, Number(it.id), Number(it.price), Number(it.grams)]
        );
      }
    }

    await conn.commit();
    res.json({ ok: true, carts: carts.length });
  } catch (error) {
    await conn.rollback();
    console.error('Cart sync failed:', error);
    res.status(500).json({ error: error.message || 'Failed to sync carts' });
  } finally {
    conn.release();
  }
});

module.exports = router;
