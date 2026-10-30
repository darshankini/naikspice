const router = require('express').Router();
const db = require('../db');
const { lineTotal } = require('../pricing');

// POST /api/orders
// { items: [{ id, name, price, grams }] } — price is per kg, grams is the weight sold.
// Creates an order + its line items inside a transaction.
router.post('/', async (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];

  if (!items.length) {
    return res.status(400).json({
      error: 'items required'
    });
  }

  if (items.some((item) => !Number.isInteger(Number(item.grams)) || Number(item.grams) <= 0)) {
    return res.status(400).json({
      error: 'grams must be a positive whole number'
    });
  }

  const total = items.reduce(
    (sum, item) =>
      sum + lineTotal(item.price, item.grams),
    0
  );

  const itemCount = items.length;

  const conn = await db.pool.getConnection();

  try {
    await conn.beginTransaction();

    // Create order
    const [orderResult] = await conn.query(
      'INSERT INTO orders (total, item_count) VALUES (?, ?)',
      [total, itemCount]
    );

    const [[order]] = await conn.query(
      'SELECT id, created_at FROM orders WHERE id = ?',
      [orderResult.insertId]
    );

    // Create order items (mysql2 expands a nested array into multiple VALUES tuples)
    const rows = items.map((item) => [
      order.id,
      item.id || null,
      item.name,
      Number(item.price),
      Number(item.grams),
      lineTotal(item.price, item.grams)
    ]);

    await conn.query(
      `INSERT INTO order_items
       (order_id, product_id, name, price, grams, amount)
       VALUES ?`,
      [rows]
    );

    await conn.commit();

    res.status(201).json({
      id: order.id,
      total,
      item_count: itemCount,
      created_at: order.created_at
    });

  } catch (error) {
    await conn.rollback();

    console.error('Order creation failed:', error);

    res.status(500).json({
      error: error.message || 'Failed to create order'
    });

  } finally {
    conn.release();
  }
});

// POST /api/orders/:id/customer
// { name?, mobile?, email? } — optional customer details attached to an existing order.
// The order is already saved at checkout; this only adds contact info if the customer gives it.
router.post('/:id/customer', async (req, res) => {
  const orderId = Number(req.params.id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return res.status(400).json({ error: 'invalid order id' });
  }

 let { name, mobile, email, cash, online, total } = req.body || {};
  name = (typeof name === 'string' && name.trim()) || null;
  email = (typeof email === 'string' && email.trim()) || null;

  // Payment amounts: blank/undefined -> 0, must be valid non-negative numbers.
  const toAmount = (v) => (v === undefined || v === null || v === '' ? 0 : Number(v));
  const cashAmt = toAmount(cash);
  const onlineAmt = toAmount(online);
  const totalAmt = toAmount(total);
  if ([cashAmt, onlineAmt, totalAmt].some((n) => !Number.isFinite(n) || n < 0)) {
    return res.status(400).json({ error: 'invalid payment amount' });
  }

  // Mobile: optional; if provided it must be exactly 10 digits (matches the DB CHECK).
  let mobileNum = null;
  const rawMobile = mobile == null ? '' : String(mobile).replace(/\D/g, '');
  if (rawMobile) {
    if (rawMobile.length !== 10) {
      return res.status(400).json({ error: 'mobile must be 10 digits' });
    }
    mobileNum = Number(rawMobile);
  }

  const conn = await db.pool.getConnection();
  try {
    const [o] = await conn.query('SELECT id, total FROM orders WHERE id = ?', [orderId]);
    if (!o.length) return res.status(404).json({ error: 'order not found' });

    await conn.beginTransaction();

    const [c] = await conn.query(
      `INSERT INTO customers (order_id, customer_name, customer_mobile, customer_email)
       VALUES (?, ?, ?, ?)`,
      [orderId, name, mobileNum, email]
    );

    await conn.query(
      `INSERT INTO payment (order_id, amount, cash, online, status)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, totalAmt || Number(o[0].total), cashAmt, onlineAmt, 'Completed']
    );

    await conn.commit();
    res.status(201).json({ id: c.insertId, order_id: orderId });
  } catch (error) {
    await conn.rollback().catch(() => {});
    console.error('Attach customer failed:', error);
    res.status(500).json({ error: error.message || 'Failed to save customer' });
  } finally {
    conn.release();
  }
});

router.get('/',async(req,res) => {
  try{
    const [orderData] = await db.query('SELECT * FROM orders');
    if(!orderData.length) return res.status(404).json({error: 'Orders not found'});
    return res.status(200).json(orderData);
  }catch(error){
    console.error('Something went wrong',error);
    res.status(500).json({error:error.message || 'No orders available'});
  }
})

router.get('/getOrderDetails/:id',async(req,res) =>{
  try{
    const orderId = req.params.id;
    const [orderDetails] = await db.query('SELECT * FROM orders WHERE id = ?',[orderId]);
    if(!orderDetails.length) return res.status(200).json({message : 'No record found'});

    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?',[orderId]);
    const [customer] = await db.query('SELECT * FROM customers WHERE order_id = ?',[orderId]);
    return res.status(200).json({order:orderDetails[0],items:items,customer:customer[0]});

  }catch(error){
    console.error('Something went wrong',error);
    res.status(500).json({error:error.message || 'Order not found'});
  }
})

module.exports = router;