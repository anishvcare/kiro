# Deployment Guide — cPanel (two subdomains)

This guide deploys the project to a cPanel host with SSH access.

| Part | Subdomain | What it serves | Document root |
|------|-----------|----------------|---------------|
| **Frontend** (React SPA, static) | `matri.nokkoo.in` | the built `frontend/dist` | the dist folder |
| **Backend** (Laravel API) | `api.matri.nokkoo.in` | Laravel `public/` | the Laravel `public` folder |

**Host assumptions:** PHP **8.2**, MariaDB **10.6**, SSH/Terminal, Composer available.
Auth is **Sanctum Bearer tokens** (stored in the browser) — no cookies/CSRF, so the
two subdomains talk over CORS, which is already configured via `FRONTEND_URL`.

> Replace `uddjzwrz` with your real cPanel username wherever it appears.
> The frontend is committed **pre-built** in `frontend/dist`, so **Node is NOT
> required on the server**. You only build the frontend again if you change its code.

---

## 0. One-time prep in the cPanel UI

### a) Create the API subdomain
cPanel → **Domains** → **Create a New Domain**
- Domain: `api.matri.nokkoo.in`
- **Uncheck** "share document root"; set Document Root to:
  `/home/uddjzwrz/api.matri.nokkoo.in`
  (we will repoint this to Laravel's `public` in step 3d)

You should already have `matri.nokkoo.in` → `/home/uddjzwrz/matri.nokkoo.in`.

### b) Create the database
cPanel → **MySQL Databases**
1. Create database, e.g. `matri` → becomes `uddjzwrz_matri`
2. Create user, e.g. `matriuser` → becomes `uddjzwrz_matriuser`, set a strong password (**keep it safe**)
3. **Add user to database** with **ALL PRIVILEGES**

### c) Set PHP version to 8.2
cPanel → **Select PHP Version** (MultiPHP Manager) → set `api.matri.nokkoo.in` to **8.2**.
Recommended extensions (usually on by default): `bcmath`, `ctype`, `curl`, `fileinfo`,
`json`, `mbstring`, `openssl`, `pdo`, `pdo_mysql`, `tokenizer`, `xml`.

---

## 1. Get the code onto the server

SSH in, then clone the repo into a **private** folder (not a web root):

```bash
cd ~
git clone https://github.com/anishvcare/kiro.git
# (or your branch:  git clone -b <branch> https://github.com/anishvcare/kiro.git)
```

Project is now at `~/kiro` with `~/kiro/backend` and `~/kiro/frontend`.

---

## 2. Deploy the frontend (matri.nokkoo.in)

The build is already in `frontend/dist`. Copy its **contents** into the
frontend document root:

```bash
# clean the docroot (careful: removes existing files there)
rm -rf ~/matri.nokkoo.in/*
# copy build output (note the /. to include .htaccess)
cp -a ~/kiro/frontend/dist/. ~/matri.nokkoo.in/
```

`frontend/dist/.htaccess` is included and handles SPA routing (everything →
`index.html`). Done — visiting `https://matri.nokkoo.in` should load the app
(it will show network errors until the API is up).

> If you ever change frontend code, rebuild locally with
> `cd frontend && npm install && npm run build`, commit `dist`, `git pull` on the
> server, and re-run the `cp -a` line above.

---

## 3. Deploy the backend (api.matri.nokkoo.in)

### a) Install PHP dependencies
```bash
cd ~/kiro/backend
composer install --no-dev --optimize-autoloader
```
If `composer` isn't found, use the full path (often `/usr/local/bin/ea-php82
/opt/cpanel/composer/bin/composer install ...`) or your host's documented command.

### b) Create and fill the .env
```bash
cp .env.production.example .env
```
Edit `.env` (via `nano .env` or cPanel File Manager) and set:
- `DB_DATABASE=uddjzwrz_matri`
- `DB_USERNAME=uddjzwrz_matriuser`
- `DB_PASSWORD=` your DB password
- `GOOGLE_CLIENT_SECRET=` your Google OAuth client secret
- Confirm `APP_URL=https://api.matri.nokkoo.in` and `FRONTEND_URL=https://matri.nokkoo.in`

### c) App key, migrations, caches
```bash
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

### d) Point the subdomain at Laravel's `public`
Two options — **Option 1 is cleanest**:

**Option 1 — Repoint document root (cPanel UI):**
cPanel → **Domains** → `api.matri.nokkoo.in` → manage → set Document Root to:
`/home/uddjzwrz/kiro/backend/public` → Save.

**Option 2 — Symlink (if you can't change the docroot):**
```bash
rm -rf ~/api.matri.nokkoo.in
ln -s ~/kiro/backend/public ~/api.matri.nokkoo.in
```

### e) Permissions
```bash
cd ~/kiro/backend
chmod -R 775 storage bootstrap/cache
```

The API is now live at `https://api.matri.nokkoo.in/api/...`.

---

## 4. Google OAuth setup (for "Login with Google")

In **Google Cloud Console → APIs & Services → Credentials**, edit the OAuth client
(`1021276313913-...apps.googleusercontent.com`) and add:
- **Authorized JavaScript origins:** `https://matri.nokkoo.in`
- **Authorized redirect URIs:** `https://api.matri.nokkoo.in/api/auth/google/callback`

(Email/password login works without this; only Google login needs it.)

---

## 5. Verify

```bash
# API reachable (register a throwaway user)
curl -i -X POST https://api.matri.nokkoo.in/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123","password_confirmation":"password123"}'
```
Expect `201 Created` with a `token`.

Then in a browser:
1. Open `https://matri.nokkoo.in` → register / log in.
2. Confirm the dashboard loads and there are **no CORS errors** in the console.
   (If you see CORS errors, double-check `FRONTEND_URL` exactly matches
   `https://matri.nokkoo.in` with no trailing slash, then `php artisan config:cache`.)

---

## 6. Updating later (redeploy)

```bash
cd ~/kiro && git pull

# frontend (only if it changed)
cp -a ~/kiro/frontend/dist/. ~/matri.nokkoo.in/

# backend
cd ~/kiro/backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache && php artisan route:cache
```

---

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| `500` on API, blank page | Check `backend/storage/logs/laravel.log`; ensure `storage` & `bootstrap/cache` are writable (chmod 775). |
| `419` / CSRF errors | Not expected here (token auth). Ensure the frontend sends `Authorization: Bearer` — it does by default. |
| CORS blocked | `FRONTEND_URL` must equal the SPA origin exactly; re-run `php artisan config:cache`. |
| DB connection refused | Verify `DB_HOST=127.0.0.1`, DB name/user have the `uddjzwrz_` prefix, and the user is attached to the DB. |
| API 404 on every route | Document root not pointing to `backend/public` (step 3d). |
| Config changes ignored | Run `php artisan config:clear` then `config:cache`. |

> Security: never commit the real `.env`. If a secret is ever exposed, rotate it
> (DB password in cPanel, Google secret in Google Cloud Console).
