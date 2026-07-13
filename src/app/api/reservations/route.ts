import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, baseUrl } from "@/lib/stripe";
import { findEvent } from "@/lib/events";
import { findTier, GUESTLIST_MAX } from "@/lib/tiers";
import { makeReference } from "@/lib/reference";

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const { kind, eventDate, name, email, phone, instagram, guests, note, tierId } = body;

  if (kind !== "TABLE" && kind !== "GUESTLIST") {
    return NextResponse.json({ error: "Pick a table or the guest list." }, { status: 400 });
  }
  if (!name?.trim() || !email?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: "Name, email and phone are all required." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "That email doesn't look right." }, { status: 400 });
  }

  const event = findEvent(eventDate);
  if (!event) {
    return NextResponse.json({ error: "We're not open that night." }, { status: 400 });
  }
  if (event.date < new Date().toISOString().slice(0, 10)) {
    return NextResponse.json({ error: "That night has already happened." }, { status: 400 });
  }

  const partySize = Math.max(1, Math.min(Number(guests) || 1, 12));

  // ── Guest list ─────────────────────────────────────────────────
  if (kind === "GUESTLIST") {
    if (partySize > GUESTLIST_MAX) {
      return NextResponse.json(
        { error: `Guest list tops out at ${GUESTLIST_MAX}. Take a table instead.` },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.create({
      data: {
        reference: makeReference(),
        kind,
        status: "PENDING",
        eventDate: event.date,
        eventName: event.artists,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        instagram: instagram?.trim() || null,
        guests: partySize,
        note: note?.trim() || null,
      },
    });

    return NextResponse.json({ reference: reservation.reference });
  }

  // ── Table ──────────────────────────────────────────────────────
  const tier = findTier(tierId);
  if (!tier) {
    return NextResponse.json({ error: "Pick a table." }, { status: 400 });
  }

  const reservation = await prisma.reservation.create({
    data: {
      reference: makeReference(),
      kind,
      status: "PENDING",
      eventDate: event.date,
      eventName: event.artists,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      instagram: instagram?.trim() || null,
      guests: partySize,
      note: note?.trim() || null,
      tierId: tier.id,
      minimumSpend: tier.minimumSpend,
      deposit: tier.deposit,
    },
  });

  // No key configured (local dev without Stripe): hand it to the admin queue instead.
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ reference: reservation.reference });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: reservation.email,
      client_reference_id: reservation.reference,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: tier.deposit * 100,
            product_data: {
              name: `Discotecha · ${tier.name}`,
              description: `${reservation.eventDate} · ${event.artists}. Deposit is credited against a €${tier.minimumSpend} minimum spend.`,
            },
          },
        },
      ],
      metadata: { reference: reservation.reference },
      success_url: `${baseUrl}/reserve/received?ref=${reservation.reference}&paid=1`,
      cancel_url: `${baseUrl}/reserve?date=${reservation.eventDate}`,
    });

    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ reference: reservation.reference, checkoutUrl: session.url });
  } catch (err) {
    console.error("stripe checkout failed", err);
    return NextResponse.json(
      { reference: reservation.reference, error: "Payment couldn't open. We've kept your request." },
      { status: 200 }
    );
  }
}
