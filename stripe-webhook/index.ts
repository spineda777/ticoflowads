import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const body = await req.text();
    const sb = createClient(supabaseUrl, supabaseKey);
    const event = JSON.parse(body);

    console.log("Webhook event:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { tenantId, planId } = session.metadata;

      await sb.from("subscriptions").upsert({
        tenant_id: tenantId,
        stripe_subscription_id: session.subscription,
        stripe_customer_id: session.customer,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      await sb.from("tenants").update({ plan: planId }).eq("id", tenantId);
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const { data: subData } = await sb.from("subscriptions").select("tenant_id").eq("stripe_subscription_id", subscription.id).single();
      if (subData?.tenant_id) {
        await sb.from("subscriptions").update({ status: "canceled" }).eq("stripe_subscription_id", subscription.id);
        await sb.from("tenants").update({ plan: "free" }).eq("id", subData.tenant_id);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});