require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    console.log('Running database migration...');
    
    // Read schema file
    const schemaPath = path.join(__dirname, '../../../database/schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Replace the placeholder password with a real hashed password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    schema = schema.replace('$2b$10$YourHashedPasswordHere', hashedPassword);
    
    // Execute schema
    await connection.query(schema);
    
    console.log('Migration completed successfully!');
    console.log('Default admin credentials:');
    console.log('  Email: admin@store.com');
    console.log('  Password: admin123');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
