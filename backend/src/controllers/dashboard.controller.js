const db = require('../config/database');

exports.getStats = async (req, res) => {
  try {
    const [totalProducts] = await db.query('SELECT COUNT(*) as count FROM products');
    const [totalCategories] = await db.query('SELECT COUNT(*) as count FROM categories');
    const [totalOrders] = await db.query('SELECT COUNT(*) as count FROM orders');
    const [totalCustomers] = await db.query('SELECT COUNT(*) as count FROM customers');
    
    const [lowStock] = await db.query(
      'SELECT COUNT(*) as count FROM products WHERE stock_quantity <= low_stock_threshold AND status != "inactive"'
    );
    
    const [todayOrders] = await db.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(grand_total), 0) as revenue FROM orders WHERE DATE(created_at) = CURDATE()'
    );
    
    const [monthOrders] = await db.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(grand_total), 0) as revenue FROM orders WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())'
    );

    const [recentOrders] = await db.query(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT 5'
    );

    const [ordersByStatus] = await db.query(
      'SELECT status, COUNT(*) as count FROM orders GROUP BY status'
    );

    res.json({
      stats: {
        totalProducts: totalProducts[0].count,
        totalCategories: totalCategories[0].count,
        totalOrders: totalOrders[0].count,
        totalCustomers: totalCustomers[0].count,
        lowStockProducts: lowStock[0].count,
        todayOrders: todayOrders[0].count,
        todayRevenue: todayOrders[0].revenue,
        monthOrders: monthOrders[0].count,
        monthRevenue: monthOrders[0].revenue
      },
      recentOrders,
      ordersByStatus
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
