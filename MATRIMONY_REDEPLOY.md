# Matrimony Platform — Redeploy Guide

This branch (`feat/matrimony-platform`) converts the app from the old personal-finance
app into a **matrimony platform** (Nokkoo Matri), on the **same** Laravel + React +
MariaDB stack you already deployed. Use this guide to update your live site.

> Hosting is unchanged: frontend = `matri.nokkoo.in` (static `dist`), API =
> `api.matri.nokkoo.in` (Laravel `public`). See `DEPLOYMENT.md` for the original setup.

## What changed
- **Backend:** new domain — `profiles`, `profile_photos`, `interests` tables; the old
  `categories`/`transactions` tables are dropped by a migration. New API endpoints:
  `/api/profile`, `/api/profiles`, `/api/profiles/{id}`, `/api/interests`, plus a
  matrimony `/api/dashboard`. Auth (register/login/Google) is unchanged.
- **Frontend:** rebranded to "Nokkoo Matri" (rose theme); new pages — Dashboard,
  Browse (with filters), Profile detail, My Profile (create/edit), Interests.

---

## Redeploy steps (SSH on the server)

```bash
# 1. Get the new branch
cd ~/kiro
git fetch origin
git checkout feat/matrimony-platform
git pull origin feat/matrimony-platform

# 2. Backend: install deps + run the new migrations
cd ~/kiro/backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force          # creates profiles/interests, drops finance tables
php artisan config:cache
php artisan route:cache

# 3. (Optional) seed ~25 sample profiles so Browse isn't empty for the demo
php artisan db:seed --force

# 4. Frontend: copy the prebuilt dist into the web root
cp -a ~/kiro/frontend/dist/. ~/matri.nokkoo.in/
```

> ⚠️ **Data note:** the migration **drops** the `categories` and `transactions`
> tables. They were empty/unused on `matri`, so this is safe — but if you ever put
> real data there, back it up first.

> The frontend is committed **prebuilt**; you only need Node if you change frontend
> code (`cd frontend && npm install && npm run build`, commit `dist`, then repeat
> step 4).

---

## Verify

```bash
# API up
curl -i --max-time 20 https://api.matri.nokkoo.in/up

# Browse endpoint requires auth, but registration is public:
curl -s -X POST https://api.matri.nokkoo.in/api/register \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"name":"Test","email":"t1@example.com","password":"password123","password_confirmation":"password123"}'
```

Then in a browser open **https://matri.nokkoo.in**:
1. Register / log in.
2. Go to **My Profile**, fill it in, **Save**.
3. Open **Browse** — you should see sample members (if you seeded). Open one and
   **Express Interest**.
4. Check **Interests** (received / sent tabs).

---

## API reference (all under `https://api.matri.nokkoo.in/api`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/register`, `/login`, `/auth/google` | Auth (public) |
| GET | `/user` | Current user |
| POST | `/logout` | Logout |
| GET | `/dashboard` | Stats, completeness, recommended profiles |
| GET | `/profile` | My profile (null if not created) |
| POST | `/profile` | Create / update my profile |
| GET | `/profiles` | Browse (filters: `gender, religion, caste, marital_status, district, country, q, age_min, age_max, page`) |
| GET | `/profiles/{id}` | Profile detail + my interest status |
| GET | `/interests?box=received\|sent` | List interests |
| POST | `/interests` | Express interest (`receiver_id`, `message`) |
| PUT | `/interests/{id}` | Accept / decline (`status`) |

## Notes
- This is a functional **MVP**: profiles, search/filter, express interest, accept/
  decline, dashboard. Photos use a single `photo_url` for now (a `profile_photos`
  table exists for a future gallery + uploads).
- Google login still needs `GOOGLE_CLIENT_SECRET` in the server `.env` (email/password
  works without it).
