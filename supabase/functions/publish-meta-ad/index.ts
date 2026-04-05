import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const META_API_VERSION = "v19.0";
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ad_id } = await req.json();
    if (!ad_id) {
      return new Response(JSON.stringify({ error: "ad_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch ad data
    const { data: ad, error: adError } = await supabase
      .from("ads")
      .select("*, businesses(*)")
      .eq("id", ad_id)
      .single();

    if (adError || !ad) {
      return new Response(JSON.stringify({ error: "Ad not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get selected image
    const { data: selectedImage } = await supabase
      .from("ad_images")
      .select("*")
      .eq("ad_id", ad_id)
      .eq("selected", true)
      .single();

    // Get business Meta credentials
    const business = ad.businesses;
    const accessToken = business?.meta_access_token;
    const adAccountId = business?.meta_ad_account_id;

    if (!accessToken || !adAccountId) {
      return new Response(JSON.stringify({
        error: "Meta Ads no configurado. Agrega tu Access Token y Ad Account ID en la configuración del negocio.",
        code: "META_NOT_CONFIGURED",
      }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!selectedImage) {
      return new Response(JSON.stringify({
        error: "Selecciona una imagen antes de publicar.",
        code: "NO_IMAGE_SELECTED",
      }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targeting = ad.targeting || {};
    const dailyBudget = business?.daily_budget || 10;

    // Update status to publishing
    await supabase.from("ads").update({ status: "publishing" }).eq("id", ad_id);

    try {
      // 1. Create Campaign
      const campaignRes = await fetch(`${META_BASE_URL}/act_${adAccountId}/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `TicoFlow - ${ad.ad_title || "Campaign"}`,
          objective: "OUTCOME_AWARENESS",
          status: "PAUSED",
          special_ad_categories: [],
          access_token: accessToken,
        }),
      });

      const campaignData = await campaignRes.json();
      if (campaignData.error) throw new Error(campaignData.error.message);
      const campaignId = campaignData.id;

      // 2. Create Ad Set
      const adSetBody: Record<string, any> = {
        name: `TicoFlow AdSet - ${ad.ad_title || "AdSet"}`,
        campaign_id: campaignId,
        daily_budget: Math.round(dailyBudget * 100), // Meta uses cents
        billing_event: "IMPRESSIONS",
        optimization_goal: "REACH",
        bid_strategy: "LOWEST_COST_WITHOUT_CAP",
        status: "PAUSED",
        access_token: accessToken,
        targeting: {
          age_min: targeting.age_min || 18,
          age_max: targeting.age_max || 65,
          genders: targeting.gender === "male" ? [1] : targeting.gender === "female" ? [2] : [],
          geo_locations: {
            countries: ["CR"], // Default Costa Rica
          },
          locales: targeting.languages?.includes("Spanish") ? [24] : [],
        },
      };

      if (targeting.interests && targeting.interests.length > 0) {
        adSetBody.targeting.flexible_spec = [{
          interests: targeting.interests.map((i: string) => ({ name: i })),
        }];
      }

      const adSetRes = await fetch(`${META_BASE_URL}/act_${adAccountId}/adsets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adSetBody),
      });

      const adSetData = await adSetRes.json();
      if (adSetData.error) throw new Error(adSetData.error.message);
      const adSetId = adSetData.id;

      // 3. Create Ad Creative
      const creativeRes = await fetch(`${META_BASE_URL}/act_${adAccountId}/adcreatives`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `TicoFlow Creative - ${ad.ad_title || "Creative"}`,
          object_story_spec: {
            page_id: business.meta_page_id || "",
            link_data: {
              image_url: selectedImage.image_url,
              message: ad.ad_body || "",
              name: ad.ad_title || "",
              call_to_action: {
                type: ad.call_to_action?.toUpperCase().replace(/ /g, "_") || "LEARN_MORE",
              },
            },
          },
          access_token: accessToken,
        }),
      });

      const creativeData = await creativeRes.json();
      if (creativeData.error) throw new Error(creativeData.error.message);
      const creativeId = creativeData.id;

      // 4. Create Ad
      const adRes = await fetch(`${META_BASE_URL}/act_${adAccountId}/ads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `TicoFlow Ad - ${ad.ad_title || "Ad"}`,
          adset_id: adSetId,
          creative: { creative_id: creativeId },
          status: "PAUSED",
          access_token: accessToken,
        }),
      });

      const adData = await adRes.json();
      if (adData.error) throw new Error(adData.error.message);

      // Update ad with Meta IDs
      await supabase.from("ads").update({
        meta_campaign_id: campaignId,
        meta_adset_id: adSetId,
        meta_ad_id: adData.id,
        status: "published",
        published_at: new Date().toISOString(),
      }).eq("id", ad_id);

      return new Response(JSON.stringify({
        success: true,
        campaign_id: campaignId,
        adset_id: adSetId,
        ad_id: adData.id,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (metaError: any) {
      console.error("Meta API error:", metaError);
      await supabase.from("ads").update({
        status: "error",
        error_message: `Meta Ads: ${metaError.message}`,
      }).eq("id", ad_id);

      return new Response(JSON.stringify({ error: metaError.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("publish-meta-ad error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
