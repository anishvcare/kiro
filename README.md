# Universal Local Shopping & Delivery Platform

A full-stack PWA connecting customers with local shops through an enquiry-quotation-payment-delivery workflow. Shops do NOT upload product catalogues; instead, customers search, send enquiries, receive quotations, make payments, and get deliveries.

## Architecture

- **Backend**: Node.js / Express REST API with Socket.IO for realtime features
- **Frontend**: React + Vite PWA with Tailwind CSS, Redux Toolkit
- **Database**: MySQL with Sequelize ORM
- **Auth**: JWT with refresh tokens, role-based access control

## User Roles

1. **Customer** - Searches shops, sends enquiries, accepts quotations, makes payments
2. **Shop Owner** - Receives enquiries, sends quotations, manages shop profile
3. **Delivery Agent** - Manages delivery fleet, assigns orders
4. **Delivery Boy** - Picks up and delivers orders, shares live location
5. **Super Admin** - Full platform management and oversight

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend && npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd frontend && npm install
   ```
4. Copy environment configuration:
   ```bash
   cp .env.example backend/.env
   ```
5. Import database schema:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
6. Start the backend:
   ```bash
   cd backend && npm start
   ```
7. Start the frontend dev server:
   ```bash
   cd frontend && npm run dev
   ```

## Project Structure

```
/backend
  /config        - Database and app configuration
  /controllers   - Request handlers
  /middleware     - Auth, RBAC, validation middleware
  /models        - Sequelize ORM models
  /routes        - Express route definitions
  /services      - Business logic (token, email, etc.)
  /sockets       - Socket.IO event handlers
  /utils         - Helper functions
  /uploads       - File uploads directory
  /cron          - Scheduled tasks
  /docs          - API documentation

/frontend
  /src
    /components  - Reusable UI components
    /pages       - Page-level components
    /layouts     - Layout wrappers
    /features    - Feature-specific modules
    /store       - Redux Toolkit store and slices
    /services    - API service layer
    /routes      - Route configuration
    /utils       - Utility functions
    /assets      - Static assets
    /pwa         - PWA service worker and manifest

/database
  schema.sql     - Complete MySQL schema (35+ tables)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user profile

## Environment Variables

See `.env.example` for all configuration options.

## License

MIT
