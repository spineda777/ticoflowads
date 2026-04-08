import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLANS: Record<string, { priceId: string }> = {
  starter: { priceId: "price_1QgHZX4fGTWjSEZHLIlKhYpL" },
  pro: { priceId: "price_1QgHaY4fGTWjSEZH8G3k9nKM" },
  agency: { priceId: "price_1QgHb04fGTWjSEZHpQr0vL2N" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { planId, tenantId, userEmail } = await req.json();
    const plan = PLANS[planId];

    if (!plan) {
      return new Response(JSON.stringify({ error: "Plan no válido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not configured");

    const baseUrl = Deno.env.get("SITE_URL") || "https://ticoflowads.lovable.app";

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
      throw new Error(stripeData.error?.message || "Error de Stripe");
    }

    // Devolver la URL directa para redirigir sin necesitar Stripe.js
    return new Response(JSON.stringify({ url: stripeData.url, sessionId: stripeData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
