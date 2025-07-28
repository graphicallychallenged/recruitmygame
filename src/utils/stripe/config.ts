import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
})

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  priceIds: {
    premium: {
      monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
      yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!,
    },
    pro: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
      yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
    },
  },
}
