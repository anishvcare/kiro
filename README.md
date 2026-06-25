# LeadFlow WhatsApp CRM

A complete SaaS WhatsApp CRM and Automation Platform built with Laravel 12 and Next.js.

## Technology Stack

### Backend
- **Laravel 12** (PHP 8.3+)
- **MySQL** - Primary database
- **Redis** - Queue, cache, sessions
- **Evolution API** - WhatsApp integration via Baileys
- **OpenAI** - AI chatbot

### Frontend
- **Next.js 15** (React 19)
- **TypeScript**
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **PWA** - Installable mobile app

### Infrastructure
- **Docker Compose** - Development & deployment
- **Evolution API** - WhatsApp multi-device
- cPanel / VPS / Ubuntu Server compatible

---

## Features

### 1. QR Code WhatsApp Login
- Connect existing WhatsApp number
- Scan QR code to link
- Multi-device support via Baileys

### 2. WhatsApp Shared Inbox
- All messages in one place
- Folder system: New Leads, Interested, Follow Up, Converted, Closed
- Real-time message updates
- Agent assignment

### 3. Flow Builder
- Drag & drop automation flows
- Menu responses, inputs, conditions
- Auto lead qualification
- Agent assignment nodes

### 4. Keyword Automation
- Exact, contains, starts_with matching
- Auto-reply with text, images, documents
- Trigger flows from keywords

### 5. AI Chatbot (OpenAI)
- GPT-4o / GPT-4o Mini integration
- Custom system prompts
- Knowledge base support
- Context-aware responses

### 6. Lead Qualification Bot
- Collect: Name, Place, Course Interest, Budget
- Auto-save to CRM
- Auto-assign counsellors

### 7. CRM System
- Contact profiles with tags, notes
- Conversation history
- Custom fields
- Lead pipeline (Kanban)

### 8. Lead Pipeline
Stages: New Lead → Interested → Follow-up → Processing → Converted → Closed

### 9. Campaign Module
- Bulk WhatsApp campaigns
- Text, Image, PDF, Video, Button messages
- Delivery analytics
- Rate limiting

### 10. Click-to-WhatsApp Links
- wa.me link generator
- Pre-filled messages
- Click tracking
- QR codes

### 11. Landing Page Builder
- MBBS, Russia Jobs, IELTS templates
- WhatsApp integration
- Lead capture

### 12. Auto Follow-up
- Configurable delay sequences
- Day 1, Day 3, Day 7 messages
- Auto-enrollment
- Status tracking

### 13. Team Management
- Role hierarchy: Admin → Manager → Counsellor → Agent
- Member invitation
- Activity tracking

### 14. Reports Dashboard
- Leads today, messages today
- Conversion rate
- Campaign performance
- Agent performance

### 15. Referral System
- Referral links for agents
- Commission tracking
- Payout management

### 16. Multi-Business Modules
- MBBS Admission
- Russia Jobs
- Study Abroad
- IELTS
- Visa Services

### PWA Features
- Install as mobile app (Android/iOS)
- Push notifications
- Offline support
- Fast loading

---

## Quick Start

### Prerequisites
- PHP 8.3+
- Node.js 22+
- MySQL 8.0+
- Redis 7+
- Composer

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### Docker Setup

```bash
docker-compose up -d
```

This starts:
- MySQL (port 3306)
- Redis (port 6379)
- Laravel API (port 8000)
- Next.js Frontend (port 3000)
- Evolution API (port 8080)
- Queue Worker
- Scheduler

---

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new team
- `POST /api/auth/login` - Login
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Logout

### WhatsApp
- `GET /api/whatsapp/accounts` - List accounts
- `POST /api/whatsapp/accounts` - Create instance
- `GET /api/whatsapp/accounts/{id}/qr` - Get QR code
- `GET /api/whatsapp/accounts/{id}/status` - Check status

### Conversations
- `GET /api/conversations` - List (with folder/search filters)
- `GET /api/conversations/{id}` - Get with messages
- `POST /api/conversations/{id}/messages` - Send message

### Contacts
- `GET /api/contacts` - List
- `POST /api/contacts` - Create
- `PUT /api/contacts/{id}` - Update
- `DELETE /api/contacts/{id}` - Delete

### Leads
- `GET /api/leads/pipeline` - Pipeline (Kanban)
- `GET /api/leads` - List
- `POST /api/leads` - Create
- `PUT /api/leads/{id}` - Update/Move

### Flows
- `GET /api/flows` - List
- `POST /api/flows` - Create
- `PUT /api/flows/{id}` - Update
- `DELETE /api/flows/{id}` - Delete

### Keywords
- `GET /api/keywords` - List
- `POST /api/keywords` - Create
- `PUT /api/keywords/{id}` - Update
- `DELETE /api/keywords/{id}` - Delete

### Campaigns
- `GET /api/campaigns` - List
- `POST /api/campaigns` - Create
- `POST /api/campaigns/{id}/send` - Start sending
- `POST /api/campaigns/{id}/cancel` - Cancel

### Follow-ups
- `GET /api/follow-ups` - List sequences
- `POST /api/follow-ups` - Create
- `POST /api/follow-ups/enroll` - Enroll contact

### Landing Pages
- `GET /api/landing-pages` - List
- `POST /api/landing-pages` - Create
- `PUT /api/landing-pages/{id}` - Update

### Reports
- `GET /api/dashboard` - Dashboard stats
- `GET /api/reports` - Detailed reports

### Team
- `GET /api/team/members` - List
- `POST /api/team/members` - Add
- `PUT /api/team/members/{id}` - Update
- `DELETE /api/team/members/{id}` - Remove

### Referrals
- `GET /api/referrals/dashboard` - Agent dashboard
- `GET /api/referrals` - Admin list
- `PUT /api/referrals/settings` - Update settings

---

## Deployment

### VPS (Ubuntu)
1. Install PHP 8.3, MySQL, Redis, Nginx, Node.js
2. Clone repository
3. Configure `.env` files
4. Run migrations
5. Build frontend: `npm run build`
6. Configure Nginx reverse proxy
7. Set up supervisor for queue workers
8. Install Evolution API

### cPanel
1. Upload files via File Manager
2. Set up MySQL database
3. Configure `.env` with DB credentials
4. Run `php artisan migrate` via terminal
5. Deploy frontend to subdomain
6. Configure cron: `* * * * * php artisan schedule:run`

---

## License

Proprietary - All rights reserved.
