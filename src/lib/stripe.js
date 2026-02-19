import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey && process.env.NODE_ENV === 'production') {
    console.warn("⚠️ STRIPE_SECRET_KEY is missing. Stripe services will be unavailable.");
}

export const stripe = secretKey 
    ? new Stripe(secretKey, {
        apiVersion: "2023-10-16",
        typescript: false,
    })
    : null;

export default stripe;
