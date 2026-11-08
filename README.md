# NOIRÉ · Dining After Dark

A fictional restaurant website and staff console for an interview demonstration. Public pages cover the restaurant, live menu, table reservations and contact. Staff can manage reservations, tables, menu items, customers and the inbox.

## Run locally

Install Node.js 22 or 24 LTS and start a local MongoDB server or obtain a MongoDB Atlas connection string. From the extracted `noire-restaurant` directory:

```sh
npm ci
```

Copy `.env.example` to `.env` in the project root. In PowerShell, run `Copy-Item .env.example .env`. Set `MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `JWT_SECRET`. Generate a secret with:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use a unique admin password of at least 12 characters and at most 72 UTF-8 bytes. The seed command creates the account, six tables and five dishes. Rerunning it preserves existing records and existing passwords.

```sh
npm run seed
npm run dev
```

Open [the restaurant](http://localhost:5173) or [the staff console](http://localhost:5173/admin). Sign in with the seeded credentials. The development proxy forwards API requests to port 4000. Keep that port in development or update `client/vite.config.js`.

To run the production build locally, stop the development processes and run `npm run build` followed by `npm start`. Express serves the frontend and API on [port 4000](http://localhost:4000). The server waits for MongoDB and index initialization before listening.

## Email and sample location

Set `SMTP_USER` and `SMTP_APP_PASSWORD` in the root `.env` to enable Gmail SMTP. Use a Gmail App Password. Management receives new booking and contact notifications at `MANAGEMENT_EMAIL`, which defaults to the address in the brief. Customers receive an acknowledgement and status updates. Keep SMTP disabled for interview dry runs or set the management destination to a mailbox you control. Email is dispatched asynchronously after saving. The application logs failure codes and keeps bookings and messages available in MongoDB. Delivery is best effort without a persistent queue.

To customize the sample map or address, set `VITE_MAP_QUERY` and `VITE_RESTAURANT_ADDRESS` in `client/.env.local` and rebuild or restart Vite. These values are public. Sample photography is bundled under `client/public/photos` and sourced from Unsplash. The map and hosted fonts require internet access.

## Reservation policy

Starts every half hour from 17:00 through 21:30 in `RESTAURANT_TIMEZONE`, defaulting to Asia/Karachi. Each booking holds 90 minutes. The public form accepts future times within 180 days. Pending and confirmed bookings hold slots. Rejected, completed and cancelled bookings release slots. Disabled and archived tables are excluded from new bookings. Archiving preserves the table reference on historical bookings.

## Verification

Run against a separate seeded database with SMTP disabled. The smoke test creates and modifies QA records.

```sh
node server/test/smoke.js
```

Set `QA_BASE` if the server uses an address other than http://localhost:4000. Credentials are read from the root `.env` or process environment. The test covers login, authorization, overlapping concurrent bookings, table capacity, past-date validation, cancellation, customer history, menu and table mutations, messages and dashboard.

See [API.md](API.md) for request shapes and [INTERVIEW_GUIDE.md](INTERVIEW_GUIDE.md) for the demo walkthrough.
