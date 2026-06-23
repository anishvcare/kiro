# FMGE Daily Trainer 🏥

A production-ready Progressive Web Application (PWA) for Foreign Medical Graduates preparing for the FMGE examination.

## Features

### Student Features
- 📝 **Daily Challenges** - Morning (9 AM) & Evening (7 PM) tests with 30 questions each
- 📚 **Subject Practice** - 19 FMGE subjects with topic-wise practice
- 📊 **Analytics & AI** - Weakness detection, performance tracking, FMGE readiness score
- 🔥 **30-Day Challenge** - Complete to unlock Grand Mock Exam
- 🏆 **Grand Mock Exam** - 300 questions, 300 minutes, full FMGE simulation
- 🎯 **Leaderboard** - Global, University, Country rankings
- 📱 **PWA** - Installable, offline support, push notifications
- 💳 **Subscription** - Free & Premium plans with Razorpay/Stripe

### Admin Features
- 👥 User Management
- ❓ Question Bank (Add, Edit, Delete, Bulk Import CSV/Excel)
- 📖 Subject & Topic Management
- 🔔 Push Notification Management
- 📈 Analytics & Reports
- 💰 Subscription & Revenue Management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Framer Motion |
| State | Zustand, TanStack Query |
| Backend | Laravel 12 (PHP 8.4) |
| Auth | Laravel Sanctum |
| Database | PostgreSQL |
| Cache | Redis |
| Notifications | Firebase Cloud Messaging |
| Storage | Cloudflare R2 |
| Deployment | cPanel (Node.js) / Docker |

## Quick Start

### Prerequisites
- Node.js 22+
- PHP 8.4+
- PostgreSQL 16+
- Redis 7+
- Composer 2.x

### Frontend Setup
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Docker Setup
```bash
docker-compose up -d
```

## Project Structure

```
fmge-daily-trainer/
├── frontend/                 # Next.js 15 PWA
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── (auth)/     # Login, Register, Forgot Password
│   │   │   ├── (student)/  # Dashboard, Practice, Analytics...
│   │   │   ├── (admin)/    # Admin panel
│   │   │   └── test/       # Test engine
│   │   ├── components/      # UI & Layout components
│   │   ├── stores/          # Zustand state management
│   │   ├── lib/             # API, utilities, Firebase
│   │   ├── types/           # TypeScript interfaces
│   │   └── hooks/           # Custom React hooks
│   ├── public/              # PWA assets, manifest
│   └── Dockerfile
├── backend/                  # Laravel 12 API
│   ├── app/
│   │   ├── Models/          # Eloquent models
│   │   ├── Http/Controllers/Api/  # API controllers
│   │   ├── Http/Middleware/ # Admin middleware
│   │   └── Services/        # Business logic
│   ├── database/
│   │   ├── migrations/      # Database schema
│   │   └── seeders/         # Sample data & questions
│   ├── routes/api.php       # API routes
│   └── Dockerfile
├── nginx/                    # Nginx configuration
├── docker-compose.yml
├── DEPLOYMENT.md            # cPanel deployment guide
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Email Login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/otp/send` - Send OTP
- `POST /api/auth/otp/verify` - Verify OTP
- `POST /api/auth/forgot-password` - Forgot Password

### Student
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/tests/daily/{type}` - Get daily challenge
- `POST /api/tests/{id}/start` - Start test
- `POST /api/tests/attempts/{id}/answer` - Submit answer
- `POST /api/tests/attempts/{id}/complete` - Complete test
- `GET /api/subjects` - List all subjects
- `GET /api/analytics/overview` - Analytics overview
- `GET /api/leaderboard` - Leaderboard
- `GET /api/challenge/current` - 30-day challenge

### Admin
- `GET /api/admin/dashboard` - Admin stats
- `CRUD /api/admin/users` - User management
- `CRUD /api/admin/questions` - Question management
- `CRUD /api/admin/subjects` - Subject management
- `POST /api/admin/notifications/send` - Send notifications

## Database Schema

19 FMGE subjects with 1000+ seeded questions across topics:
- Anatomy, Physiology, Biochemistry, Pathology, Pharmacology
- Microbiology, Forensic Medicine, Community Medicine
- ENT, Ophthalmology, Medicine, Surgery, Orthopedics
- Pediatrics, OBG, Dermatology, Psychiatry, Radiology, Anesthesia

## Scoring System
- ✅ Correct Answer: +1
- ❌ Wrong Answer: 0
- ⏭️ Skipped: 0

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fmgetrainer.com | admin123456 |
| Student | student@fmgetrainer.com | student123456 |

## License

MIT License - Built for FMGE aspirants
