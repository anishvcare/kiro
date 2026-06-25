# WhatsApp Auto-Reply CRM Bot

QR code scan cheythu WhatsApp connect cheyyan pattunna auto-reply chatbot + CRM.
**cPanel Shared Hosting compatible** (Baileys library - No Chromium needed!)

## Features

- 📱 QR Code connect (WhatsApp Linked Devices)
- 🔄 Editable auto-reply flows (multi-step)
- 👥 Auto-save contacts with status tracking
- 💬 Live chat monitoring
- 📊 Dashboard with stats
- 📱 PWA - phone-il install cheyyaam

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + PWA
- **Backend:** Node.js + Express + Socket.io
- **WhatsApp:** Baileys (lightweight, no Chromium!)
- **Database:** MongoDB Atlas (free cloud)

---

## cPanel Shared Hosting-il Install Cheyyunna Vidham

### Step 1: MongoDB Atlas (Free Database)

1. https://www.mongodb.com/atlas → Free account create
2. Free cluster (M0) create
3. Database User create (username + password)
4. Network Access → Allow from Anywhere (0.0.0.0/0)
5. Connect → Connection string copy:
   ```
   mongodb+srv://username:password@cluster0.xxx.mongodb.net/whatsapp-crm
   ```

### Step 2: cPanel Setup

1. **Subdomain create:** `crm.yourdomain.com`
2. **File Manager** → Subdomain folder-il files upload

### Step 3: Node.js App Create (cPanel)

1. cPanel → **Setup Node.js App**
2. Create Application:
   - Node.js: 18.x or 20.x
   - Mode: Production
   - Root: `backend`
   - Startup file: `src/index.js`
3. Environment Variables add:
   ```
   MONGO_URI = mongodb+srv://your-connection-string
   PORT = 3001
   ```

### Step 4: Install Dependencies (SSH)

```bash
# cPanel shows virtual env command - use it first
source /home/username/nodevenv/path/18/bin/activate

cd ~/crm.yourdomain.com/backend
npm install --production
```

### Step 5: Frontend Deploy

Frontend already built aanu (`frontend/dist/`).
- `frontend/dist/` contents → subdomain root-ilekk copy
- OR backend serves it automatically (already configured)

### Step 6: Start & Test

1. cPanel → Node.js App → Start
2. Browser: `https://crm.yourdomain.com`
3. "Connect" tab → QR scan
4. Done! 🎉

---

## Local Development

```bash
# Backend
cd backend
npm install
npm start

# Frontend (separate terminal)
cd frontend
npm install
npm run dev

# Need MongoDB running (local or Atlas)
```

Open: http://localhost:5173

---

## Flow Examples

"hi" message → Bot replies:
```
Namaskaram! 🙏 Welcome to our business.
1️⃣ Products
2️⃣ Services
3️⃣ Contact Us
```

User sends "1" → Products list kaanikkum

---

## API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/flows | List flows |
| POST | /api/flows | Create flow |
| PUT | /api/flows/:id | Update flow |
| PATCH | /api/flows/:id/toggle | On/Off |
| POST | /api/flows/seed | Load samples |
| GET | /api/contacts | List contacts |
| GET | /api/chats | Conversations |
| POST | /api/chats/send | Send message |
| GET | /api/health | Server status |

---

## Important Notes

⚠️ WhatsApp heavy automation = ban risk. Moderate use.
⚠️ Server 24/7 running aayi irikkanam for auto-reply.
💡 cPanel Node.js app restart aayaal QR re-scan venam.
