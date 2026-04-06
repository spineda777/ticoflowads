import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { businessName, description, budget, adId } = await req.json();

    if (!businessName || !description) {
      return new Response(JSON.stringify({ error: "businessName y description son requeridos" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const prompt = `Eres un experto en Google Ads para negocios en Latinoamérica.
Negocio: ${businessName}
Descripción: ${description}
${budget ? `Presupuesto diario: $${budget}` : ""}

Genera contenido publicitario optimizado para Google Ads.
Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "titles": ["título1", "título2", "título3", "título4", "título5"],
  "descriptions": ["desc1", "desc2", "desc3", "desc4"],
  "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5", "kw6", "kw7", "kw8", "kw9", "kw10"],
  "ad_preview": {
    "headline": "Título principal del anuncio",
    "display_url": "www.ejemplo.com",
    "description": "Descripción principal que aparece en Google"
  }
}
Restricciones: 5 títulos (máx 30 chars), 4 descripciones (máx 90 chars), 10 palabras clave relevantes.`;

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
        return new Response(JSON.stringify({ error: "Límite de solicitudes excedido." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Gemini API error");
    }

    const geminiData = await geminiResponse.json();
    const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let googleAdsContent;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      googleAdsContent = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      throw new Error("No se pudo generar el contenido");
    }

    if (adId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb = createClient(supabaseUrl, serviceKey);

      await sb.from("ads").update({
        ad_title: googleAdsContent.titles?.[0],
        ad_body: googleAdsContent.descriptions?.[0],
        call_to_action: "LEARN_MORE",
        suggested_targeting: JSON.stringify(googleAdsContent.keywords),
        status: "ready",
      }).eq("id", adId);
    }

    return new Response(JSON.stringify({ success: true, data: googleAdsContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-google-ads error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
