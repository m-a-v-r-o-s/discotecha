import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia",
});

export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
