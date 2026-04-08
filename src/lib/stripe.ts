import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe('your-secret-key', {
  apiVersion: '2020-08-27',
});

export default stripe;
