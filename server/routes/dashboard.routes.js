const router = require('express').Router();

const pool = require('../db');
const { requireAuth } = require('../auth');



router.use(requireAuth);

// GET /api/dashboard
// Today's order count, sales, and 7-day trend.
router.get('/', async (_req, res) => {
  // Today's summary
  const todayResult = await pool.query(
    `SELECT
       COUNT(*) AS orders,
       COALESCE(SUM(total), 0) AS sales
     FROM orders
     WHERE DATE(created_at) = CURDATE()`
  );

  // 7-day trend
  const trendResult = await pool.query(
    `SELECT
       DATE(created_at) AS day,
       COUNT(*) AS orders,
       COALESCE(SUM(total), 0) AS sales
     FROM orders
     WHERE created_at >= CURDATE() - INTERVAL 6 DAY
     GROUP BY DATE(created_at)
     ORDER BY day`
  );

  const today = todayResult[0][0];

  res.json({
    today: {
      orders: today.orders,
      sales: today.sales
    },
    trend: trendResult[0]
  });
});

module.exports = router;