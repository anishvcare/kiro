const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, from, to } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM orders WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
    const params = [];
    const countParams = [];

    if (status) {
      query += ' AND status = ?';
      countQuery += ' AND status = ?';
      params.push(status);
      countParams.push(status);
    }

    if (search) {
      query += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
      countQuery += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
      countParams.push(term, term, term);
    }

    if (from) {
      query += ' AND DATE(created_at) >= ?';
      countQuery += ' AND DATE(created_at) >= ?';
      params.push(from);
      countParams.push(from);
    }

    if (to) {
      query += ' AND DATE(created_at) <= ?';
      countQuery += ' AND DATE(created_at) <= ?';
      params.push(to);
      countParams.push(to);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [orders] = await db.query(query, params);
    const [countResult] = await db.query(countQuery, countParams);

    res.json({
      orders,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const [items] = await db.query(
      'SELECT oi.*, (SELECT image_url FROM product_images WHERE product_id = oi.product_id AND is_primary = 1 LIMIT 1) as image FROM order_items oi WHERE oi.order_id = ?',
      [id]
    );

    res.json({ order: { ...orders[0], items } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { customer_name, customer_phone, customer_address, customer_landmark, notes, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    // Generate order number
    const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase() + uuidv4().slice(0, 4).toUpperCase();

    // Find or create customer
    let [customers] = await connection.query('SELECT id FROM customers WHERE phone = ?', [customer_phone]);
    let customerId;

    if (customers.length > 0) {
      customerId = customers[0].id;
      await connection.query(
        'UPDATE customers SET name=?, address=?, landmark=? WHERE id=?',
        [customer_name, customer_address, customer_landmark, customerId]
      );
    } else {
      const [newCustomer] = await connection.query(
        'INSERT INTO customers (name, phone, address, landmark) VALUES (?, ?, ?, ?)',
        [customer_name, customer_phone, customer_address, customer_landmark]
      );
      customerId = newCustomer.insertId;
    }

    // Calculate totals and validate stock
    let subtotal = 0;
    let discountTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const [products] = await connection.query('SELECT * FROM products WHERE id = ? AND status = "active"', [item.product_id]);
      
      if (products.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: `Product not found: ${item.product_id}` });
      }

      const product = products[0];
      
      if (product.stock_quantity < item.quantity) {
        await connection.rollback();
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      const unitPrice = product.price;
      const discountPrice = product.discount_price || product.price;
      const totalPrice = discountPrice * item.quantity;
      const discount = (unitPrice - discountPrice) * item.quantity;

      subtotal += unitPrice * item.quantity;
      discountTotal += discount;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        quantity: item.quantity,
        unit_price: unitPrice,
        discount_price: product.discount_price,
        total_price: totalPrice
      });

      // Update stock
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, product.id]
      );
    }

    const grandTotal = subtotal - discountTotal;

    // Create order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (order_number, customer_id, customer_name, customer_phone, customer_address,
       customer_landmark, notes, subtotal, discount_total, grand_total, status, order_source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'website')`,
      [orderNumber, customerId, customer_name, customer_phone, customer_address,
       customer_landmark, notes, subtotal, discountTotal, grandTotal]
    );

    // Create order items
    const itemValues = orderItems.map(item => [
      orderResult.insertId, item.product_id, item.product_name, item.product_sku,
      item.quantity, item.unit_price, item.discount_price, item.total_price
    ]);

    await connection.query(
      `INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, discount_price, total_price)
       VALUES ?`,
      [itemValues]
    );

    // Update customer stats
    await connection.query(
      'UPDATE customers SET total_orders = total_orders + 1, total_spent = total_spent + ? WHERE id = ?',
      [grandTotal, customerId]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        id: orderResult.insertId,
        order_number: orderNumber,
        grand_total: grandTotal,
        items: orderItems
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancel_reason } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    let updateQuery = 'UPDATE orders SET status = ?';
    const params = [status];

    if (status === 'delivered') {
      updateQuery += ', delivered_at = NOW()';
    } else if (status === 'cancelled') {
      updateQuery += ', cancelled_at = NOW(), cancel_reason = ?';
      params.push(cancel_reason || null);

      // Restore stock
      const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
      for (const item of items) {
        await db.query('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [item.quantity, item.product_id]);
      }
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    const [result] = await db.query(updateQuery, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order status updated' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
