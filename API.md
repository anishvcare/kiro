# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "admin@store.com",
  "password": "admin123"
}

Response:
{
  "token": "jwt_token_here",
  "user": { "id": 1, "name": "Admin", "email": "admin@store.com", "role": "admin" }
}
```

### Get Current User
```
GET /auth/me
Authorization: Bearer <token>
```

### Change Password
```
PUT /auth/change-password
Authorization: Bearer <token>

{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

## Products

### List Products (Public)
```
GET /products?page=1&limit=20&category=1&search=term&status=active&featured=true&sort=newest
```

### Get Featured Products
```
GET /products/featured
```

### Get New Products
```
GET /products/new
```

### Get Popular Products
```
GET /products/popular
```

### Get Low Stock Products (Admin)
```
GET /products/low-stock
Authorization: Bearer <token>
```

### Get Product by Slug
```
GET /products/slug/:slug
```

### Get Product by ID
```
GET /products/:id
```

### Create Product (Admin)
```
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Full description",
  "short_description": "Short description",
  "category_id": 1,
  "sku": "SKU-001",
  "price": 100.00,
  "discount_price": 80.00,
  "stock_quantity": 50,
  "low_stock_threshold": 5,
  "unit": "piece",
  "weight": "500g",
  "is_featured": true,
  "is_popular": false,
  "status": "active",
  "meta_title": "SEO Title",
  "meta_description": "SEO Description",
  "images": [
    { "url": "/uploads/products/image.jpg", "alt": "Product Image" }
  ]
}
```

### Update Product (Admin)
```
PUT /products/:id
Authorization: Bearer <token>
```

### Delete Product (Admin)
```
DELETE /products/:id
Authorization: Bearer <token>
```

### Bulk Delete Products (Admin)
```
POST /products/bulk-delete
Authorization: Bearer <token>

{ "ids": [1, 2, 3] }
```

### Update Stock (Admin)
```
PATCH /products/:id/stock
Authorization: Bearer <token>

{ "stock_quantity": 100 }
```

## Categories

### List Categories (Public)
```
GET /categories?active=true
```

### Get Category by Slug
```
GET /categories/slug/:slug
```

### Get Category by ID
```
GET /categories/:id
```

### Create Category (Admin)
```
POST /categories
Authorization: Bearer <token>

{
  "name": "Category Name",
  "description": "Description",
  "image": "/uploads/categories/image.jpg",
  "display_order": 0,
  "is_active": true
}
```

### Update Category (Admin)
```
PUT /categories/:id
Authorization: Bearer <token>
```

### Delete Category (Admin)
```
DELETE /categories/:id
Authorization: Bearer <token>
```

## Orders

### Create Order (Public)
```
POST /orders

{
  "customer_name": "John Doe",
  "customer_phone": "9876543210",
  "customer_address": "123 Street, City",
  "customer_landmark": "Near Park",
  "notes": "Deliver by evening",
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ]
}
```

### List Orders (Admin)
```
GET /orders?page=1&limit=20&status=pending&search=term&from=2024-01-01&to=2024-12-31
Authorization: Bearer <token>
```

### Get Order by ID (Admin)
```
GET /orders/:id
Authorization: Bearer <token>
```

### Update Order Status (Admin)
```
PATCH /orders/:id/status
Authorization: Bearer <token>

{ "status": "confirmed", "cancel_reason": "optional" }
```

## Banners

### List Banners (Public)
```
GET /banners?active=true
```

### Create Banner (Admin)
```
POST /banners
Authorization: Bearer <token>

{
  "title": "Banner Title",
  "subtitle": "Subtitle text",
  "image": "/uploads/banners/image.jpg",
  "link": "/products",
  "display_order": 0,
  "is_active": true
}
```

### Update Banner (Admin)
```
PUT /banners/:id
Authorization: Bearer <token>
```

### Delete Banner (Admin)
```
DELETE /banners/:id
Authorization: Bearer <token>
```

## Customers (Admin)

### List Customers
```
GET /customers?page=1&limit=20&search=term
Authorization: Bearer <token>
```

### Get Customer
```
GET /customers/:id
Authorization: Bearer <token>
```

### Delete Customer
```
DELETE /customers/:id
Authorization: Bearer <token>
```

## Settings

### Get Public Settings
```
GET /settings/public
```

### Get All Settings (Admin)
```
GET /settings
Authorization: Bearer <token>
```

### Update Settings (Admin)
```
PUT /settings
Authorization: Bearer <token>

{
  "settings": {
    "store_name": "My Store",
    "whatsapp_number": "919876543210"
  }
}
```

## Dashboard (Admin)

### Get Dashboard Stats
```
GET /dashboard/stats
Authorization: Bearer <token>

Response:
{
  "stats": {
    "totalProducts": 50,
    "totalCategories": 10,
    "totalOrders": 200,
    "totalCustomers": 150,
    "lowStockProducts": 5,
    "todayOrders": 3,
    "todayRevenue": 1500.00,
    "monthOrders": 45,
    "monthRevenue": 45000.00
  },
  "recentOrders": [...],
  "ordersByStatus": [...]
}
```

## File Upload (Admin)

### Single Upload
```
POST /upload/:type
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary>

Types: products, categories, banners, general
```

### Multiple Upload
```
POST /upload/:type/multiple
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: <binary[]>
```

## Health Check
```
GET /health

Response: { "status": "ok", "timestamp": "2024-01-01T00:00:00.000Z" }
```
