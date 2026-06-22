const db = require('../config/database');

exports.getAll = async (req, res) => {
  try {
    const { active } = req.query;
    let query = 'SELECT * FROM banners';
    
    if (active === 'true') {
      query += ' WHERE is_active = 1';
    }
    
    query += ' ORDER BY display_order ASC';

    const [banners] = await db.query(query);
    res.json({ banners });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [banners] = await db.query('SELECT * FROM banners WHERE id = ?', [id]);
    
    if (banners.length === 0) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.json({ banner: banners[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, subtitle, image, link, display_order, is_active } = req.body;

    const [result] = await db.query(
      'INSERT INTO banners (title, subtitle, image, link, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [title, subtitle, image, link, display_order || 0, is_active !== false ? 1 : 0]
    );

    res.status(201).json({ message: 'Banner created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, image, link, display_order, is_active } = req.body;

    const [result] = await db.query(
      'UPDATE banners SET title=?, subtitle=?, image=?, link=?, display_order=?, is_active=? WHERE id=?',
      [title, subtitle, image, link, display_order || 0, is_active !== false ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.json({ message: 'Banner updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM banners WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.json({ message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
