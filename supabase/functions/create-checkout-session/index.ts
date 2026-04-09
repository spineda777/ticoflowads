import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLANS: Record<string, { priceId: string }> = {
  starter: { priceId: "price_1TKQEw0QKOBv1IMxwcuUgfQR" },
  pro:     { priceId: "price_1TKQFF0QKOBv1IMxjNjtg6k1" },
  agency:  { priceId: "price_1TKQFv0QKOBv1IMxphDMw9sq" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { planId, tenantId, userEmail } = await req.json();
    
    // 🆕 Logging más detallado
    console.log("Checkout request:", { planId, tenantId, userEmail, availablePlans: Object.keys(PLANS) });
    
    const plan = PLANS[planId];

    if (!plan) {
      console.error("Invalid plan:", planId);
      return new Response(JSON.stringify({ 
        error: "Plan no válido",
        receivedPlanId: planId,
        availablePlans: Object.keys(PLANS)
      }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not configured");

    const baseUrl = Deno.env.get("SITE_URL") || "https://ticoflowads.lovable.app";

    // 🆕 Log del price ID que se envía a Stripe
    console.log("Sending to Stripe with price:", plan.priceId);

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "customer_email": userEmail,
        "line_items[0][price]": plan.priceId,
        "line_items[0][quantity]": "1",
        "mode": "subscription",
        "success_url": `${baseUrl}/dashboard/billing?success=true`,
        "cancel_url": `${baseUrl}/dashboard/billing?cancelled=true`,
        "metadata[tenantId]": tenantId,
        "metadata[planId]": planId,
      }).toString(),
    });

    const stripeData = await response.json();

    if (!response.ok) {
      console.error("Stripe error:", stripeData);
      throw new Error(stripeData.error?.message || "Error de Stripe");
    }

    return new Response(JSON.stringify({ url: stripeData.url, sessionId: stripeData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Error desconocido";
    console.error("Checkout error:", errorMsg);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
