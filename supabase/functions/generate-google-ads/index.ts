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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Eres un experto en Google Ads para negocios en Latinoamérica. 
Genera contenido publicitario optimizado. Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
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
Restricciones:
- 5 títulos de máximo 30 caracteres cada uno
- 4 descripciones de máximo 90 caracteres cada una
- 10 palabras clave relevantes
- Títulos persuasivos con llamado a la acción
- Palabras clave con intención de compra`;

    const userPrompt = `Negocio: ${businessName}
Descripción: ${description}
${budget ? `Presupuesto diario: $${budget}` : ""}
Genera el contenido publicitario optimizado para Google Ads.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_google_ads",
            description: "Generate Google Ads content",
            parameters: {
              type: "object",
              properties: {
                titles: { type: "array", items: { type: "string" }, description: "5 ad titles, max 30 chars each" },
                descriptions: { type: "array", items: { type: "string" }, description: "4 descriptions, max 90 chars each" },
                keywords: { type: "array", items: { type: "string" }, description: "10 relevant keywords" },
                ad_preview: {
                  type: "object",
                  properties: {
                    headline: { type: "string" },
                    display_url: { type: "string" },
                    description: { type: "string" },
                  },
                  required: ["headline", "display_url", "description"],
                },
              },
              required: ["titles", "descriptions", "keywords", "ad_preview"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_google_ads" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de solicitudes excedido. Intenta de nuevo en un momento." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let googleAdsContent;

    if (toolCall?.function?.arguments) {
      googleAdsContent = JSON.parse(toolCall.function.arguments);
    } else {
      throw new Error("No se pudo generar el contenido");
    }

    // If adId provided, update the ad
    if (adId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb = createClient(supabaseUrl, serviceKey);

      await sb.from("ads").update({
        ad_title: googleAdsContent.titles[0],
        ad_body: googleAdsContent.descriptions[0],
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
