# NOCTURNE · Ios

Concept template for a private 21+ nightclub. Names, location and contact details are placeholders,
swap them before any real deployment. Next.js 14 App Router · TypeScript · Tailwind · Prisma/SQLite ·
Stripe (test mode).

## Run

```bash
npm install
cp .env.example .env      # set ADMIN_PASSWORD, INVITE_CODE, STRIPE_SECRET_KEY
npx prisma db push
npm run dev
```

## What's in it

- **Door gate**. 21+ date-of-birth check, cookie for 180 days. The eye follows the cursor.
- **Line up**. The whole season is `src/lib/events.ts`. Edit the array, the site follows: home ledger, reserve dropdown, admin grouping.
- **Reservations**
  - *Table* → picks a tier, pays a Stripe deposit, auto-confirmed by webhook.
  - *Guest list* → free request, max 4, sits in the admin queue.
  - *The Back Room* → hidden tier, only appears when a valid `INVITE_CODE` is entered.
- **Admin**. `/admin`, password from `.env`. Approve/decline, headcounts per night, deposits taken, CSV export.
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

Railway/Vercel. Swap the SQLite `DATABASE_URL` for Postgres in `prisma/schema.prisma` (`provider = "postgresql"`) before going live: SQLite won't survive a redeploy on ephemeral filesystems.

## Photos

All photography is from [Unsplash](https://unsplash.com/license) (free license, no attribution
required, credited anyway). Human-shot, pre-AI-era uploads:

- `crowd-wide.webp` / `crowd.webp` · Jack (@kuj_world) · https://unsplash.com/photos/-eqm30LNAlE
  (35mm film; desaturated to B&W, two crops, 16:9 for desktop, 2:3 for portrait)
- `press-crowd.webp` · Logan Weaver · https://unsplash.com/photos/vJlaWLnGcb0
  (desaturated to B&W, framed on the raised arms so faces survive the cover-crop)
- `red-window.webp` · Evgenia Stergioula · https://unsplash.com/photos/B2ckC1dmuhM
- `neon-steps.webp` · David Libeert · https://unsplash.com/photos/_SJlJ2ZRtZA
- `red-floor.webp` · Aleksandr Popov · https://unsplash.com/photos/7KE9owtQCUA
- `neon-bar.webp` · camilo jimenez · https://unsplash.com/photos/EesL2HtBYbI

## Next

- Email confirmations (Resend) carrying the address + reference
- Capacity cap per night, waitlist when a night sells out
- myDATA invoice stub for the deposits
