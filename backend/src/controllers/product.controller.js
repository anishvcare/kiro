const db = require('../config/database');
const slugify = require('slugify');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, status, featured, sort = 'newest' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `SELECT p.*, c.name as category_name, 
                 (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
                 FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1`;
    let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE 1=1';
    const params = [];
    const countParams = [];

    if (category) {
      query += ' AND p.category_id = ?';
      countQuery += ' AND p.category_id = ?';
      params.push(category);
      countParams.push(category);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)';
      countQuery += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (status) {
      query += ' AND p.status = ?';
      countQuery += ' AND p.status = ?';
      params.push(status);
      countParams.push(status);
    }

    if (featured === 'true') {
      query += ' AND p.is_featured = 1';
      countQuery += ' AND p.is_featured = 1';
    }

    // Sorting
    switch (sort) {
      case 'price_low': query += ' ORDER BY p.price ASC'; break;
      case 'price_high': query += ' ORDER BY p.price DESC'; break;
      case 'name': query += ' ORDER BY p.name ASC'; break;
      case 'popular': query += ' ORDER BY p.views DESC'; break;
      default: query += ' ORDER BY p.created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [products] = await db.query(query, params);
    const [countResult] = await db.query(countQuery, countParams);

    res.json({
      products,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [products] = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`, [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const [images] = await db.query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order', [id]
    );

    // Increment views
    await db.query('UPDATE products SET views = views + 1 WHERE id = ?', [id]);

    res.json({ product: { ...products[0], images } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const [products] = await db.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.slug = ?`, [slug]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const [images] = await db.query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order', [products[0].id]
    );

    await db.query('UPDATE products SET views = views + 1 WHERE id = ?', [products[0].id]);

    res.json({ product: { ...products[0], images } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, short_description, category_id, sku, price, discount_price,
            stock_quantity, low_stock_threshold, unit, weight, is_featured, is_popular,
            status, meta_title, meta_description, images } = req.body;

    const slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now().toString(36);

    const [result] = await db.query(
      `INSERT INTO products (name, slug, description, short_description, category_id, sku, price,
       discount_price, stock_quantity, low_stock_threshold, unit, weight, is_featured, is_popular,
       status, meta_title, meta_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, description, short_description, category_id, sku, price,
       discount_price || null, stock_quantity || 0, low_stock_threshold || 5, unit || 'piece',
       weight, is_featured ? 1 : 0, is_popular ? 1 : 0, status || 'active',
       meta_title, meta_description]
    );

    // Add images
    if (images && images.length > 0) {
      const imageValues = images.map((img, index) => [
        result.insertId, img.url, img.alt || name, index === 0 ? 1 : 0, index
      ]);
      await db.query(
        'INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES ?',
        [imageValues]
      );
    }

    res.status(201).json({ message: 'Product created', id: result.insertId, slug });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Product with this SKU already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, short_description, category_id, sku, price, discount_price,
            stock_quantity, low_stock_threshold, unit, weight, is_featured, is_popular,
            status, meta_title, meta_description, images } = req.body;

    const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let slug = existing[0].slug;
    if (name && name !== existing[0].name) {
      slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now().toString(36);
    }

    await db.query(
      `UPDATE products SET name=?, slug=?, description=?, short_description=?, category_id=?,
       sku=?, price=?, discount_price=?, stock_quantity=?, low_stock_threshold=?, unit=?,
       weight=?, is_featured=?, is_popular=?, status=?, meta_title=?, meta_description=?
       WHERE id=?`,
      [name, slug, description, short_description, category_id, sku, price,
       discount_price || null, stock_quantity, low_stock_threshold || 5, unit || 'piece',
       weight, is_featured ? 1 : 0, is_popular ? 1 : 0, status || 'active',
       meta_title, meta_description, id]
    );

    // Update images if provided
    if (images) {
      await db.query('DELETE FROM product_images WHERE product_id = ?', [id]);
      if (images.length > 0) {
        const imageValues = images.map((img, index) => [
          id, img.url, img.alt || name, index === 0 ? 1 : 0, index
        ]);
        await db.query(
          'INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES ?',
          [imageValues]
        );
      }
    }

    res.json({ message: 'Product updated', slug });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No product IDs provided' });
    }

    await db.query('DELETE FROM products WHERE id IN (?)', [ids]);
    res.json({ message: `${ids.length} products deleted` });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock_quantity } = req.body;

    await db.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [stock_quantity, id]);
    res.json({ message: 'Stock updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getFeatured = async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT p.*, 
       (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
       FROM products p WHERE p.is_featured = 1 AND p.status = 'active' ORDER BY p.created_at DESC LIMIT 12`
    );
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getNew = async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT p.*, 
       (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
       FROM products p WHERE p.is_new = 1 AND p.status = 'active' ORDER BY p.created_at DESC LIMIT 12`
    );
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPopular = async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT p.*, 
       (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
       FROM products p WHERE p.status = 'active' ORDER BY p.views DESC LIMIT 12`
    );
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getLowStock = async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT p.*, c.name as category_name,
       (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.stock_quantity <= p.low_stock_threshold AND p.status != 'inactive'
       ORDER BY p.stock_quantity ASC`
    );
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
