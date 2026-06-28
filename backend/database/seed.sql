-- Seed Data for Local Shopping & Delivery Platform
-- Use this file after importing schema.sql for testing purposes

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- SAMPLE USERS
-- ============================================

-- Password for all test users: "password123" (bcrypt hash)
-- $2a$10$xVqYLGwYZ0GHX5PmGJdqY.EtGKb5VZwPvFKjp8VGKfJ8OxB3dC6Oe

INSERT INTO users (id, email, phone, password_hash, first_name, last_name, is_active, is_verified, email_verified_at) VALUES
('u-admin-001', 'admin@localshop.com', '9000000001', '$2a$10$xVqYLGwYZ0GHX5PmGJdqY.EtGKb5VZwPvFKjp8VGKfJ8OxB3dC6Oe', 'Super', 'Admin', TRUE, TRUE, NOW()),
('u-customer-001', 'customer1@test.com', '9100000001', '$2a$10$xVqYLGwYZ0GHX5PmGJdqY.EtGKb5VZwPvFKjp8VGKfJ8OxB3dC6Oe', 'Rajesh', 'Kumar', TRUE, TRUE, NOW()),
('u-customer-002', 'customer2@test.com', '9100000002', '$2a$10$xVqYLGwYZ0GHX5PmGJdqY.EtGKb5VZwPvFKjp8VGKfJ8OxB3dC6Oe', 'Priya', 'Sharma', TRUE, TRUE, NOW()),
('u-customer-003', 'customer3@test.com', '9100000003', '$2a$10$xVqYLGwYZ0GHX5PmGJdqY.EtGKb5VZwPvFKjp8VGKfJ8OxB3dC6Oe', 'Amit', 'Patel', TRUE, TRUE, NOW()),
('u-shop-001', 'shop1@test.com', '9200000001', '$2a$10$xVqYLGwYZ0GHX5PmGJdqY.EtGKb5VZwPvFKjp8VGKfJ8OxB3dC6Oe', 'Suresh', 'Grocery', TRUE, TRUE, NOW()),
('u-shop-002', 'shop2@test.com', '9200000002', '$2a$10$xVqYLGwYZ0GHX5PmGJdqY.EtGKb5VZwPvFKjp8VGKfJ8OxB3dC6Oe', 'Vikram', 'Electronics', TRUE, TRUE, NOW()),
('u-shop-003', 'shop3@test.com', '9200000003', '$2a$10$xVqYLGwYZ0GHX5PmGJdqY.EtGKb5VZwPvFKjp8VGKfJ8OxB3dC6Oe', 'Meena', 'Pharma', TRUE, TRUE, NOW()),
('u-agent-001', 'agent1@test.com', '9300000001', '$2a$10$xVqYLGwYZ0GHX5PmGJdqY.EtGKb5VZwPvFKjp8VGKfJ8OxB3dC6Oe', 'Ravi', 'Delivery', TRUE, TRUE, NOW()),
('u-boy-001', 'boy1@test.com', '9400000001', '$2a$10$xVqYLGwYZ0GHX5PmGJdqY.EtGKb5VZwPvFKjp8VGKfJ8OxB3dC6Oe', 'Kiran', 'Runner', TRUE, TRUE, NOW()),
('u-boy-002', 'boy2@test.com', '9400000002', '$2a$10$xVqYLGwYZ0GHX5PmGJdqY.EtGKb5VZwPvFKjp8VGKfJ8OxB3dC6Oe', 'Santosh', 'Wheels', TRUE, TRUE, NOW());

-- ============================================
-- USER ROLE ASSIGNMENTS
-- ============================================

INSERT INTO user_roles (user_id, role_id) VALUES
('u-admin-001', 5),
('u-customer-001', 1),
('u-customer-002', 1),
('u-customer-003', 1),
('u-shop-001', 2),
('u-shop-002', 2),
('u-shop-003', 2),
('u-agent-001', 3),
('u-boy-001', 4),
('u-boy-002', 4);

-- ============================================
-- CUSTOMERS
-- ============================================

INSERT INTO customers (id, user_id, default_address, latitude, longitude, city, pincode) VALUES
('c-001', 'u-customer-001', '123 MG Road, Bangalore', 12.9716, 77.5946, 'Bangalore', '560001'),
('c-002', 'u-customer-002', '456 Anna Nagar, Chennai', 13.0827, 80.2707, 'Chennai', '600040'),
('c-003', 'u-customer-003', '789 Baner Road, Pune', 18.5204, 73.8567, 'Pune', '411045');

-- ============================================
-- SHOPS
-- ============================================

INSERT INTO shops (id, owner_id, name, description, category_id, address, latitude, longitude, city, pincode, phone, is_active, is_verified, rating, total_ratings) VALUES
('s-001', 'u-shop-001', 'Suresh Fresh Groceries', 'Fresh vegetables, fruits, and daily essentials delivered to your door', 1, '10 Commercial Street, Bangalore', 12.9750, 77.6010, 'Bangalore', '560001', '9200000001', TRUE, TRUE, 4.5, 120),
('s-002', 'u-shop-002', 'Vikram Tech Store', 'Latest electronics, gadgets, and accessories at competitive prices', 2, '22 Electronics City, Bangalore', 12.8440, 77.6620, 'Bangalore', '560100', '9200000002', TRUE, TRUE, 4.2, 85),
('s-003', 'u-shop-003', 'Meena Health Pharmacy', 'Genuine medicines, healthcare products, and wellness items', 3, '5 Hospital Road, Bangalore', 12.9680, 77.5850, 'Bangalore', '560002', '9200000003', TRUE, TRUE, 4.7, 200);

-- ============================================
-- SHOP KEYWORDS
-- ============================================

INSERT INTO shop_keywords (shop_id, keyword) VALUES
('s-001', 'vegetables'),
('s-001', 'fruits'),
('s-001', 'grocery'),
('s-001', 'milk'),
('s-001', 'daily essentials'),
('s-002', 'mobile'),
('s-002', 'laptop'),
('s-002', 'electronics'),
('s-002', 'charger'),
('s-002', 'earphones'),
('s-003', 'medicine'),
('s-003', 'pharmacy'),
('s-003', 'tablets'),
('s-003', 'wellness'),
('s-003', 'first aid');

-- ============================================
-- DELIVERY AGENTS & BOYS
-- ============================================

INSERT INTO delivery_agents (id, user_id, company_name, service_area_radius, is_active, is_verified, commission_rate, total_deliveries, rating) VALUES
('da-001', 'u-agent-001', 'Ravi Express Delivery', 15, TRUE, TRUE, 12.00, 450, 4.3);

INSERT INTO delivery_boys (id, user_id, agent_id, vehicle_type, vehicle_number, is_available, is_active, total_deliveries, rating) VALUES
('db-001', 'u-boy-001', 'da-001', 'bike', 'KA-01-AB-1234', TRUE, TRUE, 230, 4.5),
('db-002', 'u-boy-002', 'da-001', 'scooter', 'KA-01-CD-5678', TRUE, TRUE, 180, 4.2);

-- ============================================
-- SERVICE AREAS
-- ============================================

INSERT INTO service_areas (name, city, state, pincode, latitude, longitude, radius_km, is_active) VALUES
('Bangalore Central', 'Bangalore', 'Karnataka', '560001', 12.9716, 77.5946, 10, TRUE),
('Bangalore South', 'Bangalore', 'Karnataka', '560076', 12.8900, 77.5900, 8, TRUE),
('Electronics City', 'Bangalore', 'Karnataka', '560100', 12.8440, 77.6620, 5, TRUE),
('Chennai Central', 'Chennai', 'Tamil Nadu', '600001', 13.0827, 80.2707, 12, TRUE),
('Pune West', 'Pune', 'Maharashtra', '411045', 18.5204, 73.8567, 10, TRUE);

-- ============================================
-- SAMPLE REQUESTS
-- ============================================

INSERT INTO customer_requests (id, customer_id, shop_id, request_text, status, delivery_address, delivery_latitude, delivery_longitude, urgency, created_at) VALUES
('req-001', 'c-001', 's-001', 'Need 2kg tomatoes, 1kg onions, 500g green chillies, and 1L milk', 'completed', '123 MG Road, Bangalore', 12.9716, 77.5946, 'normal', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('req-002', 'c-001', 's-002', 'Looking for iPhone 15 Pro Max 256GB - Natural Titanium color', 'quoted', '123 MG Road, Bangalore', 12.9716, 77.5946, 'normal', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('req-003', 'c-002', 's-003', 'Need Paracetamol 500mg (strip of 10), Vitamin C tablets, and Dettol handwash', 'pending', '456 Anna Nagar, Chennai', 13.0827, 80.2707, 'urgent', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('req-004', 'c-003', 's-001', 'Weekly grocery: 5kg rice, 2kg dal, cooking oil 1L, sugar 1kg, tea powder 500g', 'accepted', '789 Baner Road, Pune', 18.5204, 73.8567, 'scheduled', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('req-005', 'c-001', 's-003', 'Need blood pressure monitor - Omron brand preferred', 'viewed', '123 MG Road, Bangalore', 12.9716, 77.5946, 'normal', NOW());

-- ============================================
-- SAMPLE QUOTATIONS
-- ============================================

INSERT INTO quotations (id, request_id, shop_id, total_amount, delivery_charge, discount, tax_amount, final_amount, notes, status, created_at) VALUES
('q-001', 'req-001', 's-001', 250.00, 30.00, 0.00, 0.00, 280.00, 'Fresh items available. Can deliver within 1 hour.', 'accepted', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('q-002', 'req-002', 's-002', 134900.00, 0.00, 2000.00, 0.00, 132900.00, 'Available in stock. Original sealed box with warranty.', 'sent', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('q-003', 'req-004', 's-001', 850.00, 40.00, 50.00, 0.00, 840.00, 'All items available. Basmati rice premium quality.', 'accepted', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ============================================
-- QUOTATION ITEMS
-- ============================================

INSERT INTO quotation_items (quotation_id, item_name, quantity, unit, unit_price, total_price) VALUES
('q-001', 'Tomatoes', 2, 'kg', 60.00, 120.00),
('q-001', 'Onions', 1, 'kg', 40.00, 40.00),
('q-001', 'Green Chillies', 500, 'g', 30.00, 30.00),
('q-001', 'Milk (Nandini)', 1, 'L', 60.00, 60.00),
('q-002', 'iPhone 15 Pro Max 256GB', 1, 'unit', 134900.00, 134900.00),
('q-003', 'Basmati Rice Premium', 5, 'kg', 120.00, 600.00),
('q-003', 'Toor Dal', 2, 'kg', 80.00, 160.00),
('q-003', 'Sunflower Oil', 1, 'L', 140.00, 140.00),
('q-003', 'Sugar', 1, 'kg', 45.00, 45.00),
('q-003', 'Brooke Bond Tea', 500, 'g', 55.00, 55.00);

-- ============================================
-- SAMPLE PAYMENTS
-- ============================================

INSERT INTO payment_transactions (id, quotation_id, customer_id, shop_id, amount, payment_method, status, paid_at, created_at) VALUES
('pt-001', 'q-001', 'c-001', 's-001', 280.00, 'upi', 'success', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('pt-002', 'q-003', 'c-003', 's-001', 840.00, 'cod', 'success', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ============================================
-- SAMPLE DELIVERY ASSIGNMENTS
-- ============================================

INSERT INTO delivery_assignments (id, transaction_id, delivery_boy_id, agent_id, status, pickup_address, delivery_address, delivery_latitude, delivery_longitude, actual_delivery_time, created_at) VALUES
('del-001', 'pt-001', 'db-001', 'da-001', 'delivered', '10 Commercial Street, Bangalore', '123 MG Road, Bangalore', 12.9716, 77.5946, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('del-002', 'pt-002', 'db-002', 'da-001', 'in_transit', '10 Commercial Street, Bangalore', '789 Baner Road, Pune', 18.5204, 73.8567, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ============================================
-- SAMPLE CASH COLLECTIONS
-- ============================================

INSERT INTO cash_collections (id, delivery_assignment_id, delivery_boy_id, amount, collected_at, settled) VALUES
('cc-001', 'del-002', 'db-002', 840.00, DATE_SUB(NOW(), INTERVAL 1 DAY), FALSE);

-- ============================================
-- SAMPLE NOTIFICATIONS
-- ============================================

INSERT INTO notifications (id, user_id, title, body, type, is_read, created_at) VALUES
('n-001', 'u-customer-001', 'Quotation Received', 'Suresh Fresh Groceries sent you a quotation for your request.', 'quotation', TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('n-002', 'u-customer-001', 'Delivery Completed', 'Your order has been delivered successfully.', 'delivery', TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('n-003', 'u-shop-001', 'New Request', 'You have a new customer request from Amit Patel.', 'request', FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('n-004', 'u-boy-001', 'New Delivery Assignment', 'You have been assigned a new delivery.', 'assignment', TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('n-005', 'u-customer-003', 'Order In Transit', 'Your order is on the way! Track your delivery in real-time.', 'delivery', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ============================================
-- SAMPLE RATINGS & REVIEWS
-- ============================================

INSERT INTO ratings (user_id, target_type, target_id, transaction_id, score) VALUES
('u-customer-001', 'shop', 's-001', 'pt-001', 5),
('u-customer-001', 'delivery_boy', 'db-001', 'pt-001', 4);

INSERT INTO reviews (rating_id, comment, is_visible) VALUES
(1, 'Excellent quality vegetables! Fresh and well-packed. Delivery was quick.', TRUE),
(2, 'Delivery boy was polite and delivered on time.', TRUE);

-- ============================================
-- ADMIN SETTINGS
-- ============================================

INSERT INTO admin_settings (setting_key, setting_value, setting_type, description) VALUES
('platform_commission', '5', 'number', 'Platform commission percentage'),
('min_order_amount', '50', 'number', 'Minimum order amount in INR'),
('max_delivery_radius', '15', 'number', 'Maximum delivery radius in km'),
('delivery_base_charge', '30', 'number', 'Base delivery charge in INR'),
('delivery_per_km_charge', '8', 'number', 'Per km delivery charge in INR'),
('support_email', 'support@localshop.com', 'string', 'Support email address'),
('support_phone', '1800-123-4567', 'string', 'Support phone number'),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode'),
('allow_cod', 'true', 'boolean', 'Allow cash on delivery'),
('allow_upi', 'true', 'boolean', 'Allow UPI payments');

SET FOREIGN_KEY_CHECKS = 1;
