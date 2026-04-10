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
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

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

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini error:", geminiResponse.status, errText);
      if (geminiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit. Intenta más tarde." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Gemini API error");
    }

    const geminiData = await geminiResponse.json();
    const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let targeting;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      targeting = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      targeting = {
        age_min: 18, age_max: 65, gender: "all",
        interests: ["general"], locations: [location || "Costa Rica"],
        languages: ["Spanish"], daily_budget_suggestion: 10,
        estimated_reach: "Estimación no disponible",
        recommendation: "Segmentación general recomendada",
      };
    }

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
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
