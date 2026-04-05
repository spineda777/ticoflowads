import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ad_id, business_type, description, target_audience, location, objective } = await req.json();

    if (!ad_id) {
      return new Response(JSON.stringify({ error: "ad_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `Eres un experto en Meta Ads y segmentación de audiencias para negocios en Latinoamérica.

Genera una segmentación profesional para este anuncio:
- Tipo de negocio: ${business_type || "general"}
- Descripción: ${description || "negocio local"}
- Audiencia objetivo: ${target_audience || "público general"}
- Ubicación: ${location || "Costa Rica"}
- Objetivo: ${objective || "alcance"}

Responde SOLO con JSON válido con esta estructura exacta:
{
  "age_min": 25,
  "age_max": 55,
  "gender": "all",
  "interests": ["interest1", "interest2", "interest3"],
  "locations": ["City, Country"],
  "languages": ["Spanish"],
  "daily_budget_suggestion": 10,
  "estimated_reach": "5,000 - 15,000 personas",
  "recommendation": "Breve recomendación estratégica"
}

Sé específico y realista con los intereses de Meta Ads.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Eres un experto en Meta Ads. Responde SOLO con JSON válido." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit. Intenta más tarde." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let targeting;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      targeting = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      targeting = {
        age_min: 18,
        age_max: 65,
        gender: "all",
        interests: ["general"],
        locations: [location || "Costa Rica"],
        languages: ["Spanish"],
        daily_budget_suggestion: 10,
        estimated_reach: "Estimación no disponible",
        recommendation: "Segmentación general recomendada",
      };
    }

    // Save targeting to ad
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("ads").update({ targeting }).eq("id", ad_id);

    return new Response(JSON.stringify({ success: true, targeting }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-targeting error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
