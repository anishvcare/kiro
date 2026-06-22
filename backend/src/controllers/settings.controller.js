const db = require('../config/database');

exports.getAll = async (req, res) => {
  try {
    const { group } = req.query;
    let query = 'SELECT * FROM settings';
    const params = [];

    if (group) {
      query += ' WHERE setting_group = ?';
      params.push(group);
    }

    query += ' ORDER BY setting_group, setting_key';
    const [settings] = await db.query(query, params);

    // Convert to key-value object
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.setting_key] = s.setting_value;
    });

    res.json({ settings: settingsObj, raw: settings });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPublic = async (req, res) => {
  try {
    const [settings] = await db.query(
      'SELECT setting_key, setting_value FROM settings WHERE setting_group IN (?, ?, ?, ?)',
      ['general', 'social', 'seo', 'appearance']
    );

    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.setting_key] = s.setting_value;
    });

    res.json({ settings: settingsObj });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings data' });
    }

    for (const [key, value] of Object.entries(settings)) {
      await db.query(
        'UPDATE settings SET setting_value = ? WHERE setting_key = ?',
        [value, key]
      );
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateSingle = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const [result] = await db.query(
      'UPDATE settings SET setting_value = ? WHERE setting_key = ?',
      [value, key]
    );

    if (result.affectedRows === 0) {
      // Create if not exists
      await db.query(
        'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)',
        [key, value]
      );
    }

    res.json({ message: 'Setting updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
