const { Sequelize } = require('sequelize');
require('dotenv').config();

const dialectOptions = {
  // Allows running the multi-statement schema.sql during first-run bootstrap.
  multipleStatements: true,
  ...(process.env.DB_SSL === 'true'
    ? {
      ssl: {
        require: true,
        rejectUnauthorized: true,
      },
    }
    : {}),
};

const sslConfig = { dialectOptions };

const config = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'local_shopping_platform',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    ...sslConfig,
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME_TEST || 'local_shopping_platform_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },
    ...sslConfig,
  },
};

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

let sequelize;
try {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: dbConfig.logging,
      pool: dbConfig.pool,
      ...(dbConfig.dialectOptions ? { dialectOptions: dbConfig.dialectOptions } : {}),
    }
  );
} catch (error) {
  console.warn('Database connection configuration error:', error.message);
  sequelize = new Sequelize('sqlite::memory:', { logging: false });
}

module.exports = { sequelize, config };
