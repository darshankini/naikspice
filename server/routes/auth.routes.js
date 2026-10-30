const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { sign } = require('../auth');

// POST /api/auth/login  { username, password }
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username and Password required' });

  const result = await pool.query('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
  
  const user = result[0][0];
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ token: sign(user), user: { id: user.id, username: user.username, name: user.name } });
});

module.exports = router;
