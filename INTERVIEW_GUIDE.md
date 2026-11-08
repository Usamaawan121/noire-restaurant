# NOIRÉ · Xallama interview guide

## Architecture

React Router separates the public website and staff console. React Hook Form and Zod validate the public forms. Axios calls Express over a same-origin API in the production build. Tailwind CSS, custom theme styles, Lucide and Framer Motion provide the interface. Express validates inputs independently and uses Mongoose to persist state. Nodemailer sends optional Gmail SMTP notifications after writes.

| File | What to show |
| --- | --- |
| client/src/public.jsx | Booking form, availability refresh, confirmation and contact |
| client/src/admin.jsx | Protected console, dashboard and management screens |
| client/src/api.js | API client and error normalization |
| server/models.js | Schemas, references and database-level overlap constraint |
| server/reservations.js | Timezone validation, capacity rules and booking updates |
| server/index.js | Routes, authentication middleware, analytics and error handling |
| server/mail.js | Escaped HTML notifications and graceful SMTP failure handling |
| server/test/smoke.js | Real API checks, including concurrent requests |

## Data and request flow

Admin stores the bcrypt password hash and role. Table stores number, category, capacity and booking eligibility. Reservation references Table and Customer and snapshots the contact information entered for that booking. Customer groups bookings under a normalized email address. MenuItem stores dish details and availability. ContactMessage stores inbound messages and read state.

Login verifies a password with bcrypt and issues a signed JWT. The client keeps it for the browser tab session. Protected requests verify expiry, signature, issuer and role. The server also checks that the admin record still exists.

A 90-minute sitting is represented as three half-hour UTC buckets. Availability excludes any table whose active reservation intersects those buckets. At write time, the partial unique multikey index on table and buckets is authoritative. If two requests overlap, MongoDB rejects one with a duplicate key and the API returns 409. Pending and confirmed bookings hold the index entries. Cancellation releases them. The same index applies when staff change the time or reactivate a booking.

The API persists the booking before starting management and customer emails. The customer sees a pending reservation reference immediately. SMTP failure is logged without credentials and the booking remains saved.

## Five-minute demo

1. **0:00–0:45** Open the home page and browse the searchable menu.
2. **0:45–1:45** Pick a future date, party size and available table. Submit and show the reference.
3. **1:45–2:45** Sign in to `/admin`, find the reservation, confirm it and open the customer history.
4. **2:45–3:45** Show dashboard totals and demonstrate editing a menu dish or marking an inbox message read.
5. **3:45–5:00** Show the overlap index and smoke test. Explain the difference between preliminary availability and the database write.

Start MongoDB, configure the root `.env`, then run `npm ci`, `npm run seed` and `npm run dev`. Open http://localhost:5173 before screen sharing.

## Interview questions

**Why does availability need to be checked again?** Two clients may see the same availability response. The unique multikey index arbitrates at write time.

**Why use UTC buckets?** The UI accepts local time. Converting to UTC gives one numeric representation for overlap checks and avoids relying on string comparisons.

**How do you prevent stale admin edits?** Each booking update matches its current document version and increments it. Competing edits based on the same version receive a conflict.

**Why archive tables?** Past and upcoming booking records retain a meaningful table reference and staff can still review booking history.

**What happens if email fails?** MongoDB already contains the record. The current process logs the SMTP error. A durable outbox would add retries and delivery tracking for a larger deployment.

**Where does dashboard revenue come from?** The revenue card is a labelled demonstration figure. Other dashboard values come from MongoDB.
