# BizTrack - Next.js + MongoDB

Frontend and backend now run in one Next.js App Router project. Vite, Supabase and the separate Node HTTP server are no longer used.

## Run

Use Node 20.19+ (Node 22 LTS recommended). In PowerShell at D:\growDashboard:

```powershell
npm install
./scripts/start-mongo.ps1
npm run db:check
npm run dev
```

Open http://127.0.0.1:3000. Choose Create your workspace and register the single owner. Once created, further registrations are blocked. Use Sign in next time. Password reset is not implemented.

Only one app terminal is needed. Keep MongoDB running. Next.js automatically loads .env.local:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=biztrack
```

Do not prefix database configuration with NEXT_PUBLIC_. For an authenticated database, update the URI privately. Existing records from the earlier MongoDB backend remain in the same database; browser-only and Supabase records are not automatically imported.

## Structure

- src/app/page.tsx: dashboard client entry, with browser-only rendering for charts/storage.
- src/app/layout.tsx: styles, metadata and PWA links.
- src/app/api/[...path]/route.ts: Next.js Node-runtime API Route Handler.
- server/handler.mjs: authentication and product/entry CRUD.
- server/db.mjs: cached MongoDB connection with hot-reload reuse and retry on failure.
- server/validation.mjs: server-side record validation.
- public/manifest.webmanifest, public/sw.js: install manifest and offline shell.

API: GET /api/health and /api/auth/session; POST /api/auth/register, /api/auth/login, /api/auth/logout; GET/PUT /api/products and /api/entries; DELETE /api/products/:id and /api/entries/:id.

## Data and access

MongoDB collections/indexes initialize on the first API request. Passwords use salted scrypt. Sessions use random HttpOnly, SameSite=Strict cookies with expiry. Input is whitelisted and validated. Queries are owner-scoped. UUID upserts prevent duplicate retries. Referenced products cannot be deleted. Mutations are serialized within the single local Next.js process; this is not a multi-instance transaction strategy.

MongoDB/API are PC-local. The API rejects non-loopback hosts and cross-site browser requests. Local MongoDB may be accessible without authentication to other computer processes. Internet hosting requires a reviewed HTTPS/authentication/host policy configuration and Secure cookies. Login attempts are rate limited. Back up MongoDB before deleting .mongo-data.

Cancelled sales contribute zero revenue/orders. Record total costs only once. Spending-only entries are supported. Product profit excludes unassigned spending; dashboard totals include it. Calendar dates use Asia/Kolkata.

## PWA and offline

Service-worker registration is production-only. Shell/static assets are cached; API responses are excluded. A dedicated offline page is shown if the shell is unavailable. Initial session restoration requires the API. No offline write queue exists; open forms are lost on refresh. Save confirmation waits for MongoDB acknowledgement. Logout clears owner browser cache, not database records.

A phone's localhost means the phone, not this PC. Phone access needs a separate HTTPS LAN/hosted setup. Android Chrome installation: browser menu, Install app/Add to Home screen. iPhone Safari: Share, Add to Home Screen.

## Checks and production

```powershell
npm run test:server
npm test
npm run build
npm start
```

Development and production both use http://127.0.0.1:3000. Health: http://127.0.0.1:3000/api/health. Run only one app process on this port. Deployment needs a Next.js Node-capable host, not a static dist upload.

Eight backend validation tests pass. The assistant environment blocks npm registry DNS (ENOTFOUND) and local MongoDB connection (EACCES). Next.js build, database CRUD and browser checks are not verified here. Check responsive widths 320/375/390/768/1440 before release.

## Vercel deployment

Set APP_URL to your exact HTTPS site origin, MONGODB_URI to your private MongoDB Atlas connection string, and MONGODB_DB to biztrack in Vercel environment variables. Redeploy after changing variables. Vercel deployment domains are also recognized automatically. Same-origin checks remain enabled and production cookies use Secure. Localhost MongoDB cannot be reached from Vercel; use Atlas and configure network access for the deployment. Never commit database passwords; rotate previously committed credentials.
