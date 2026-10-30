require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded product images.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/categories', require('./routes/categories.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/orders', require('./routes/orders.routes'));
app.use('/api/carts', require('./routes/carts.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(500).json({
    error: err.message || 'Server error'
  });
});

module.exports = app;

// Only start a local server when running locally
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`POS API running on http://localhost:${PORT}`);
  });
}