# DISCOTECHA — Paros

Private 21+ nightclub. Next.js 14 App Router · TypeScript · Tailwind · Prisma/SQLite · Stripe (test mode).

## Run

```bash
npm install
cp .env.example .env      # set ADMIN_PASSWORD, INVITE_CODE, STRIPE_SECRET_KEY
npx prisma db push
npm run dev
```

## What's in it

- **Door gate** — 21+ date-of-birth check, cookie for 180 days. The eye follows the cursor.
- **Line up** — the whole season is `src/lib/events.ts`. Edit the array, the site follows: home ledger, reserve dropdown, admin grouping.
- **Reservations**
  - *Table* → picks a tier, pays a Stripe deposit, auto-confirmed by webhook.
  - *Guest list* → free request, max 4, sits in the admin queue.
  - *The Back Room* → hidden tier, only appears when a valid `INVITE_CODE` is entered.
- **Admin** — `/admin`, password from `.env`. Approve/decline, headcounts per night, deposits taken, CSV export.
- **Address is never published.** It goes out with the confirmation. That's the whole positioning.

## Stripe (test mode)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
Copy the `whsec_…` into `STRIPE_WEBHOOK_SECRET`. Test card `4242 4242 4242 4242`.

`checkout.session.completed` → reservation flips to `CONFIRMED` + `paid`.

## Tiers

Edit `src/lib/tiers.ts`. Minimum spend and deposit are euros.

## Deploy

Railway/Vercel. Swap the SQLite `DATABASE_URL` for Postgres in `prisma/schema.prisma` (`provider = "postgresql"`) before going live — SQLite won't survive a redeploy on ephemeral filesystems.

## Next

- Email confirmations (Resend) carrying the address + reference
- Capacity cap per night, waitlist when a night sells out
- myDATA invoice stub for the deposits
