import { loadStripe } from "@stripe/js";

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);
