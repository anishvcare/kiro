const db = require('../config/database');
const slugify = require('slugify');

exports.getAll = async (req, res) => {
  try {
    const { active } = req.query;
    let query = 'SELECT c.*, (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count FROM categories c';
    const params = [];

    if (active === 'true') {
      query += ' WHERE c.is_active = 1';
    }

    query += ' ORDER BY c.display_order ASC, c.name ASC';

    const [categories] = await db.query(query, params);
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [categories] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    
    if (categories.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category: categories[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const [categories] = await db.query('SELECT * FROM categories WHERE slug = ?', [slug]);
    
    if (categories.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category: categories[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, image, parent_id, display_order, is_active } = req.body;
    const slug = slugify(name, { lower: true, strict: true });

    const [result] = await db.query(
      'INSERT INTO categories (name, slug, description, image, parent_id, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, slug, description, image, parent_id || null, display_order || 0, is_active !== false ? 1 : 0]
    );

    res.status(201).json({ message: 'Category created', id: result.insertId, slug });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, parent_id, display_order, is_active } = req.body;

    const [existing] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    let slug = existing[0].slug;
    if (name && name !== existing[0].name) {
      slug = slugify(name, { lower: true, strict: true });
    }

    await db.query(
      'UPDATE categories SET name=?, slug=?, description=?, image=?, parent_id=?, display_order=?, is_active=? WHERE id=?',
      [name, slug, description, image, parent_id || null, display_order || 0, is_active !== false ? 1 : 0, id]
    );

    res.json({ message: 'Category updated', slug });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has products
    const [products] = await db.query('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [id]);
    if (products[0].count > 0) {
      return res.status(400).json({ error: 'Cannot delete category with products. Move or delete products first.' });
    }

    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
