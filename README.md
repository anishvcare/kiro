# RetailShop PWA - Complete Mobile-First Progressive Web Application

A production-ready mobile-first Progressive Web Application (PWA) for small retail shops, grocery stores, fish shops, meat shops, vegetable stores, bakeries, mobile shops, hardware stores, and local businesses.

## Features

- **Mobile-First Design** - Optimized for mobile users, installable as PWA
- **Admin Dashboard** - Complete store management interface
- **Customer Storefront** - Beautiful shopping experience
- **WhatsApp Ordering** - Send orders directly via WhatsApp
- **Inventory Management** - Track stock with low-stock alerts
- **Dark/Light Mode** - Full theme support
- **SEO Optimized** - Meta tags, sitemap, schema markup
- **PWA Support** - Offline page, install prompt, service worker

## Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Auth:** JWT Authentication
- **File Upload:** Local Storage / S3 Compatible

## Project Structure

```
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   │   ├── admin/     # Admin dashboard pages
│   │   │   └── store/     # Customer storefront pages
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utility functions
│   │   └── assets/        # Static assets
│   └── public/            # Public assets & PWA files
├── backend/           # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, upload, validation
│   │   ├── config/        # Configuration files
│   │   └── utils/         # Utility functions
│   └── uploads/           # File upload directory
└── database/          # MySQL schema & seeds
```

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. Clone the repository
2. Copy environment files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
3. Configure your database in `backend/.env`
4. Run database migration:
   ```bash
   cd backend && npm run migrate
   ```
5. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
6. Start development:
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend
   cd frontend && npm run dev
   ```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide using Ubuntu, Nginx, and PM2.

## API Documentation

See [API.md](./API.md) for complete API documentation.

## License

MIT
