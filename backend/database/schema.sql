-- Universal Local Shopping & Delivery Platform
-- Complete MySQL Database Schema

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- CORE USER & AUTH TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  module VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP NULL,
  phone_verified_at TIMESTAMP NULL,
  last_login_at TIMESTAMP NULL,
  refresh_token TEXT,
  reset_password_token VARCHAR(255),
  reset_password_expires TIMESTAMP NULL,
  fcm_token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_phone (phone)
);

CREATE TABLE IF NOT EXISTS user_roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id CHAR(36) NOT NULL,
  role_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_role (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_permission (role_id, permission_id)
);

-- ============================================
-- CUSTOMER TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS customers (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL UNIQUE,
  default_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  city VARCHAR(100),
  pincode VARCHAR(10),
  preferences JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- SHOP TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS shop_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(255),
  description VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shops (
  id CHAR(36) PRIMARY KEY,
  owner_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INT,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  city VARCHAR(100),
  pincode VARCHAR(10),
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  email VARCHAR(255),
  logo_url VARCHAR(500),
  banner_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_ratings INT DEFAULT 0,
  opening_time TIME,
  closing_time TIME,
  working_days JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES shop_categories(id) ON DELETE SET NULL,
  INDEX idx_shops_location (latitude, longitude),
  INDEX idx_shops_city (city),
  INDEX idx_shops_pincode (pincode)
);

CREATE TABLE IF NOT EXISTS shop_keywords (
  id INT PRIMARY KEY AUTO_INCREMENT,
  shop_id CHAR(36) NOT NULL,
  keyword VARCHAR(100) NOT NULL,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  INDEX idx_shop_keywords (keyword)
);

CREATE TABLE IF NOT EXISTS search_tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tag VARCHAR(100) NOT NULL UNIQUE,
  category_id INT,
  usage_count INT DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES shop_categories(id) ON DELETE SET NULL,
  INDEX idx_search_tags (tag)
);

-- ============================================
-- DELIVERY TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS delivery_agents (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL UNIQUE,
  company_name VARCHAR(255),
  license_number VARCHAR(100),
  service_area_radius INT DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  commission_rate DECIMAL(5, 2) DEFAULT 10.00,
  total_deliveries INT DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS delivery_boys (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL UNIQUE,
  agent_id CHAR(36),
  vehicle_type ENUM('bike', 'scooter', 'bicycle', 'car', 'van') DEFAULT 'bike',
  vehicle_number VARCHAR(50),
  license_number VARCHAR(100),
  is_available BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  total_deliveries INT DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (agent_id) REFERENCES delivery_agents(id) ON DELETE SET NULL
);

-- ============================================
-- REQUEST & QUOTATION TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS customer_requests (
  id CHAR(36) PRIMARY KEY,
  customer_id CHAR(36) NOT NULL,
  shop_id CHAR(36) NOT NULL,
  request_text TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Customer Request Sent',
  delivery_address TEXT,
  delivery_latitude DECIMAL(10, 8),
  delivery_longitude DECIMAL(11, 8),
  urgency ENUM('normal', 'urgent', 'scheduled') DEFAULT 'normal',
  scheduled_date DATE,
  scheduled_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  INDEX idx_requests_status (status),
  INDEX idx_requests_customer (customer_id),
  INDEX idx_requests_shop (shop_id)
);

CREATE TABLE IF NOT EXISTS request_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_id CHAR(36) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  caption VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES customer_requests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quotations (
  id CHAR(36) PRIMARY KEY,
  request_id CHAR(36) NOT NULL,
  shop_id CHAR(36) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_charge DECIMAL(10, 2) DEFAULT 0.00,
  discount DECIMAL(10, 2) DEFAULT 0.00,
  tax_amount DECIMAL(10, 2) DEFAULT 0.00,
  final_amount DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  valid_until TIMESTAMP,
  bill_image_url VARCHAR(500),
  approx_weight DECIMAL(10, 2),
  status ENUM('sent', 'viewed', 'accepted', 'rejected', 'expired') DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES customer_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  INDEX idx_quotations_request (request_id),
  INDEX idx_quotations_status (status)
);

CREATE TABLE IF NOT EXISTS quotation_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quotation_id CHAR(36) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  quantity INT DEFAULT 1,
  unit VARCHAR(50),
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  notes VARCHAR(255),
  FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
);

-- ============================================
-- PAYMENT TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS payment_methods (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  code VARCHAR(30) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shop_payment_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  shop_id CHAR(36) NOT NULL,
  payment_method_id INT NOT NULL,
  account_details JSON NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payment_gateway_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  gateway_name VARCHAR(50) NOT NULL,
  config JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id CHAR(36) PRIMARY KEY,
  quotation_id CHAR(36) NOT NULL,
  customer_id CHAR(36) NOT NULL,
  shop_id CHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  gateway_transaction_id VARCHAR(255),
  status ENUM('initiated', 'pending', 'success', 'failed', 'refunded') DEFAULT 'initiated',
  paid_at TIMESTAMP NULL,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  INDEX idx_payments_status (status),
  INDEX idx_payments_quotation (quotation_id)
);

CREATE TABLE IF NOT EXISTS upi_payment_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_id CHAR(36) NOT NULL,
  upi_id VARCHAR(255),
  upi_ref_number VARCHAR(100),
  status VARCHAR(50),
  response_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payment_webhooks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  gateway VARCHAR(50) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSON NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_webhooks_processed (processed)
);

CREATE TABLE IF NOT EXISTS payment_screenshots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_id CHAR(36) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_by CHAR(36),
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- DELIVERY ASSIGNMENT TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS delivery_assignments (
  id CHAR(36) PRIMARY KEY,
  transaction_id CHAR(36),
  delivery_boy_id CHAR(36),
  agent_id CHAR(36),
  status ENUM('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'returned') DEFAULT 'pending',
  pickup_address TEXT,
  pickup_latitude DECIMAL(10, 8),
  pickup_longitude DECIMAL(11, 8),
  delivery_address TEXT,
  delivery_latitude DECIMAL(10, 8),
  delivery_longitude DECIMAL(11, 8),
  estimated_delivery_time TIMESTAMP NULL,
  actual_delivery_time TIMESTAMP NULL,
  delivery_proof_url VARCHAR(500),
  notes TEXT,
  delivery_step VARCHAR(50) DEFAULT 'assigned',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (delivery_boy_id) REFERENCES delivery_boys(id) ON DELETE SET NULL,
  FOREIGN KEY (agent_id) REFERENCES delivery_agents(id) ON DELETE SET NULL,
  INDEX idx_delivery_status (status)
);

CREATE TABLE IF NOT EXISTS cash_collections (
  id CHAR(36) PRIMARY KEY,
  delivery_assignment_id CHAR(36) NOT NULL,
  delivery_boy_id CHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  settled BOOLEAN DEFAULT FALSE,
  settled_at TIMESTAMP NULL,
  FOREIGN KEY (delivery_assignment_id) REFERENCES delivery_assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (delivery_boy_id) REFERENCES delivery_boys(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settlement_transactions (
  id CHAR(36) PRIMARY KEY,
  from_type ENUM('platform', 'delivery_agent', 'delivery_boy') NOT NULL,
  from_id CHAR(36) NOT NULL,
  to_type ENUM('shop', 'delivery_agent', 'delivery_boy', 'platform') NOT NULL,
  to_id CHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  reference_type VARCHAR(50),
  reference_id CHAR(36),
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- COMMUNICATION TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS chats (
  id CHAR(36) PRIMARY KEY,
  request_id CHAR(36),
  participant_one CHAR(36) NOT NULL,
  participant_two CHAR(36) NOT NULL,
  last_message_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES customer_requests(id) ON DELETE SET NULL,
  FOREIGN KEY (participant_one) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_two) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_chats_participants (participant_one, participant_two)
);

CREATE TABLE IF NOT EXISTS messages (
  id CHAR(36) PRIMARY KEY,
  chat_id CHAR(36) NOT NULL,
  sender_id CHAR(36) NOT NULL,
  content TEXT,
  message_type ENUM('text', 'image', 'file', 'location', 'system') DEFAULT 'text',
  file_url VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_messages_chat (chat_id),
  INDEX idx_messages_created (created_at)
);

CREATE TABLE IF NOT EXISTS live_locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  delivery_assignment_id CHAR(36) NOT NULL,
  delivery_boy_id CHAR(36) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(6, 2),
  speed DECIMAL(6, 2),
  heading DECIMAL(5, 2),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (delivery_assignment_id) REFERENCES delivery_assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (delivery_boy_id) REFERENCES delivery_boys(id) ON DELETE CASCADE,
  INDEX idx_live_location_assignment (delivery_assignment_id),
  INDEX idx_live_location_time (recorded_at)
);

-- ============================================
-- NOTIFICATIONS & REVIEWS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  type VARCHAR(50),
  reference_type VARCHAR(50),
  reference_id CHAR(36),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_read (is_read)
);

CREATE TABLE IF NOT EXISTS ratings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id CHAR(36) NOT NULL,
  target_type ENUM('shop', 'delivery_boy', 'delivery_agent') NOT NULL,
  target_id CHAR(36) NOT NULL,
  transaction_id CHAR(36),
  score TINYINT NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id) ON DELETE SET NULL,
  UNIQUE KEY unique_rating (user_id, target_type, target_id, transaction_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rating_id INT NOT NULL,
  comment TEXT,
  images JSON,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rating_id) REFERENCES ratings(id) ON DELETE CASCADE
);

-- ============================================
-- SERVICE AREAS & ADMIN
-- ============================================

CREATE TABLE IF NOT EXISTS service_areas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  pincode VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  radius_km INT DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  description VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50),
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  assigned_to CHAR(36),
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_tickets_status (status),
  INDEX idx_tickets_user (user_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id CHAR(36),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id CHAR(36),
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_created (created_at)
);

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO roles (name, description) VALUES
  ('customer', 'Customer who searches and places orders'),
  ('shop_owner', 'Shop owner who receives enquiries and sends quotations'),
  ('delivery_agent', 'Delivery agent who manages a fleet of delivery boys'),
  ('delivery_boy', 'Delivery boy who picks up and delivers orders'),
  ('super_admin', 'Platform administrator with full access');

INSERT INTO permissions (name, description, module) VALUES
  ('users.view', 'View user details', 'users'),
  ('users.manage', 'Create/update/delete users', 'users'),
  ('shops.view', 'View shop details', 'shops'),
  ('shops.manage', 'Create/update/delete shops', 'shops'),
  ('requests.create', 'Create customer requests', 'requests'),
  ('requests.view', 'View requests', 'requests'),
  ('quotations.create', 'Create quotations', 'quotations'),
  ('quotations.view', 'View quotations', 'quotations'),
  ('payments.process', 'Process payments', 'payments'),
  ('payments.view', 'View payment details', 'payments'),
  ('delivery.assign', 'Assign delivery tasks', 'delivery'),
  ('delivery.update', 'Update delivery status', 'delivery'),
  ('admin.settings', 'Manage admin settings', 'admin'),
  ('admin.reports', 'View admin reports', 'admin');

INSERT INTO payment_methods (name, code) VALUES
  ('UPI', 'upi'),
  ('Cash on Delivery', 'cod'),
  ('Bank Transfer', 'bank_transfer'),
  ('Wallet', 'wallet');

INSERT INTO shop_categories (name, description) VALUES
  ('Grocery', 'Grocery and daily essentials'),
  ('Electronics', 'Electronics and gadgets'),
  ('Pharmacy', 'Medicines and healthcare'),
  ('Restaurant', 'Food and beverages'),
  ('Hardware', 'Hardware and tools'),
  ('Clothing', 'Apparel and fashion'),
  ('Stationery', 'Books and stationery'),
  ('General Store', 'General merchandise');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- ADDITIONAL PERFORMANCE INDEXES
-- ============================================

-- Search and location indexes
CREATE INDEX IF NOT EXISTS idx_shops_category ON shops(category_id);
CREATE INDEX IF NOT EXISTS idx_shops_active ON shops(is_active);
CREATE INDEX IF NOT EXISTS idx_shops_verified ON shops(is_verified);
CREATE INDEX IF NOT EXISTS idx_shops_rating ON shops(rating DESC);
CREATE INDEX IF NOT EXISTS idx_shops_owner ON shops(owner_id);

-- Request performance indexes
CREATE INDEX IF NOT EXISTS idx_requests_created ON customer_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_requests_urgency ON customer_requests(urgency);

-- Payment performance indexes
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payment_transactions(paid_at);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payment_transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payment_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_shop ON payment_transactions(shop_id);

-- Delivery performance indexes
CREATE INDEX IF NOT EXISTS idx_delivery_boy ON delivery_assignments(delivery_boy_id);
CREATE INDEX IF NOT EXISTS idx_delivery_agent ON delivery_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_delivery_created ON delivery_assignments(created_at);
CREATE INDEX IF NOT EXISTS idx_delivery_time ON delivery_assignments(actual_delivery_time);

-- Cash collection indexes
CREATE INDEX IF NOT EXISTS idx_cash_settled ON cash_collections(settled);
CREATE INDEX IF NOT EXISTS idx_cash_boy ON cash_collections(delivery_boy_id);
CREATE INDEX IF NOT EXISTS idx_cash_collected ON cash_collections(collected_at);

-- Settlement indexes
CREATE INDEX IF NOT EXISTS idx_settlement_status ON settlement_transactions(status);
CREATE INDEX IF NOT EXISTS idx_settlement_from ON settlement_transactions(from_type, from_id);
CREATE INDEX IF NOT EXISTS idx_settlement_to ON settlement_transactions(to_type, to_id);

-- User activity indexes
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);
