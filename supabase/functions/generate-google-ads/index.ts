import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { businessName, description, budget, goal, radius, adId, generateVariants } = await req.json();

    if (!businessName) {
      return new Response(JSON.stringify({ error: "businessName es requerido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const goalLabel = goal === "calls" ? "llamadas telefónicas" : goal === "sales" ? "ventas online" : goal === "bookings" ? "reservaciones" : "tráfico web";

    const variantCount = generateVariants ? 5 : 1;

    const prompt = `Eres un experto en Google Ads para negocios en Latinoamérica.
Negocio: ${businessName}
${description ? `Descripción: ${description}` : ""}
${budget ? `Presupuesto mensual: $${budget}` : ""}
Objetivo principal: ${goalLabel}
${radius ? `Radio de segmentación: ${radius}` : ""}

Genera ${variantCount} variantes DISTINTAS de campaña optimizadas para Google Ads (Search).
Cada variante debe tener un enfoque diferente (precio, beneficios, urgencia, autoridad, emocional).

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "variants": [
    {
      "campaign_name": "Nombre creativo de la campaña",
      "titles": ["título1", "título2", "título3", "título4", "título5"],
      "descriptions": ["desc1", "desc2", "desc3", "desc4"],
      "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5", "kw6", "kw7", "kw8", "kw9", "kw10"]
    }
  ]
}
Restricciones: 5 títulos (máx 30 chars), 4 descripciones (máx 90 chars), 10 keywords relevantes. Nombres de campaña creativos y únicos.`;

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
        return new Response(JSON.stringify({ error: "Límite de solicitudes excedido. Intenta en unos minutos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Error en la API de generación");
    }

    const geminiData = await geminiResponse.json();
    const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let googleAdsContent;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      googleAdsContent = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      throw new Error("No se pudo procesar la respuesta de IA");
    }

    // If updating an existing ad
    if (adId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb = createClient(supabaseUrl, serviceKey);

      const firstVariant = googleAdsContent.variants?.[0];
      if (firstVariant) {
        await sb.from("ads").update({
          ad_title: firstVariant.titles?.[0],
          ad_body: firstVariant.descriptions?.[0],
          call_to_action: "LEARN_MORE",
          suggested_targeting: JSON.stringify(firstVariant.keywords),
          status: "ready",
        }).eq("id", adId);
      }
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
