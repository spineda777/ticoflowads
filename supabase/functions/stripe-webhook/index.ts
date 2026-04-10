import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

function constructEvent(payload: string, signature: string, secret: string) {
  const elements = Object.fromEntries(
    signature.split(",").map((pair) => {
      const [k, v] = pair.split("=");
      return [k, v];
    })
  );

  const timestamp = elements["t"];
  const expectedSig = elements["v1"];

  const signedPayload = `${timestamp}.${payload}`;
  const computedSig = createHmac("sha256", secret)
    .update(new TextEncoder().encode(signedPayload))
    .toString("hex");

  if (computedSig !== expectedSig) {
    throw new Error("Invalid signature");
  }

  return JSON.parse(payload);
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing signature" }), { status: 400 });
    }

    const event = constructEvent(body, signature, webhookSecret);
    const sb = createClient(supabaseUrl, supabaseKey);

    console.log("Webhook event:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (!session.metadata?.tenantId || !session.metadata?.planId) {
        console.error("Missing metadata in checkout session");
        return new Response(JSON.stringify({ error: "Missing metadata" }), { status: 400 });
      }

      const { tenantId, planId } = session.metadata;

      await sb.from("subscriptions").upsert({
        tenant_id: tenantId,
        stripe_subscription_id: session.subscription,
        stripe_customer_id: session.customer,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: "tenant_id" });

      await sb.from("tenants").update({ plan: planId }).eq("id", tenantId);
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object;
      const { data: subData } = await sb.from("subscriptions")
        .select("tenant_id")
        .eq("stripe_subscription_id", subscription.id)
        .single();

      if (subData?.tenant_id) {
        const status = subscription.status === "active" ? "active" :
                       subscription.status === "past_due" ? "past_due" : "canceled";

        await sb.from("subscriptions").update({ status }).eq("stripe_subscription_id", subscription.id);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const { data: subData } = await sb.from("subscriptions")
        .select("tenant_id")
        .eq("stripe_subscription_id", subscription.id)
        .single();

      if (subData?.tenant_id) {
        await sb.from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);
        await sb.from("tenants")
          .update({ plan: "free" })
          .eq("id", subData.tenant_id);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (e) {
    console.error("Webhook error:", e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 400 });
  }
});