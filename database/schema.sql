-- RetailShop PWA - Complete MySQL Database Schema
-- Run this file to create all required tables

CREATE DATABASE IF NOT EXISTS retailshop_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE retailshop_db;

-- =============================================
-- Users Table (Admin accounts)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin') DEFAULT 'admin',
    avatar VARCHAR(500) NULL,
    is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB;

-- =============================================
-- Categories Table
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT NULL,
    image VARCHAR(500) NULL,
    parent_id INT NULL,
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_parent (parent_id),
    INDEX idx_active (is_active),
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================
-- Products Table
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    description TEXT NULL,
    short_description VARCHAR(500) NULL,
    category_id INT NOT NULL,
    sku VARCHAR(100) NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount_price DECIMAL(10, 2) NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    unit VARCHAR(50) DEFAULT 'piece',
    weight VARCHAR(50) NULL,
    is_featured TINYINT(1) DEFAULT 0,
    is_popular TINYINT(1) DEFAULT 0,
    is_new TINYINT(1) DEFAULT 1,
    status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
    meta_title VARCHAR(255) NULL,
    meta_description VARCHAR(500) NULL,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_category (category_id),
    INDEX idx_status (status),
    INDEX idx_featured (is_featured),
    INDEX idx_popular (is_popular),
    INDEX idx_price (price),
    INDEX idx_stock (stock_quantity),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- Product Images Table
-- =============================================
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255) NULL,
    is_primary TINYINT(1) DEFAULT 0,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product (product_id),
    INDEX idx_primary (is_primary),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- Customers Table
-- =============================================
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150) NULL,
    address TEXT NULL,
    landmark VARCHAR(255) NULL,
    city VARCHAR(100) NULL,
    pincode VARCHAR(10) NULL,
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0.00,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_name (name)
) ENGINE=InnoDB;

-- =============================================
-- Orders Table
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NULL,
    customer_landmark VARCHAR(255) NULL,
    notes TEXT NULL,
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_total DECIMAL(12, 2) DEFAULT 0.00,
    grand_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status ENUM('pending', 'confirmed', 'processing', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'cod',
    order_source ENUM('website', 'whatsapp') DEFAULT 'website',
    delivered_at DATETIME NULL,
    cancelled_at DATETIME NULL,
    cancel_reason VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order_number (order_number),
    INDEX idx_customer (customer_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- Order Items Table
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100) NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2) NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- Banners Table
-- =============================================
CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NULL,
    subtitle VARCHAR(500) NULL,
    image VARCHAR(500) NOT NULL,
    link VARCHAR(500) NULL,
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
) ENGINE=InnoDB;

-- =============================================
-- Settings Table (Key-Value Store)
-- =============================================
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NULL,
    setting_type ENUM('text', 'textarea', 'number', 'boolean', 'json', 'image') DEFAULT 'text',
    setting_group VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key),
    INDEX idx_group (setting_group)
) ENGINE=InnoDB;

-- =============================================
-- Default Settings Data
-- =============================================
INSERT INTO settings (setting_key, setting_value, setting_type, setting_group) VALUES
('store_name', 'My Store', 'text', 'general'),
('store_logo', NULL, 'image', 'general'),
('store_favicon', NULL, 'image', 'general'),
('store_address', '', 'textarea', 'general'),
('store_phone', '', 'text', 'general'),
('store_email', '', 'text', 'general'),
('whatsapp_number', '', 'text', 'general'),
('google_map_link', '', 'text', 'general'),
('store_opening_hours', '{}', 'json', 'general'),
('currency_symbol', '₹', 'text', 'general'),
('low_stock_threshold', '5', 'number', 'inventory'),
('facebook_url', '', 'text', 'social'),
('instagram_url', '', 'text', 'social'),
('twitter_url', '', 'text', 'social'),
('youtube_url', '', 'text', 'social'),
('meta_title', 'My Store - Shop Online', 'text', 'seo'),
('meta_description', 'Shop the best products at great prices', 'textarea', 'seo'),
('og_image', NULL, 'image', 'seo'),
('primary_color', '#1C1C1C', 'text', 'appearance'),
('accent_color', '#F5B800', 'text', 'appearance'),
('dark_mode_enabled', 'true', 'boolean', 'appearance')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- =============================================
-- Default Admin User (password: admin123)
-- =============================================
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@store.com', '$2b$10$YourHashedPasswordHere', 'admin')
ON DUPLICATE KEY UPDATE name = VALUES(name);
