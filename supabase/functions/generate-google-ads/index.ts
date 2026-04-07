import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Retry con backoff exponencial
async function callGeminiWithRetry(apiKey: string, body: object, maxRetries = 3): Promise<Response> {
  const models = ["gemini-1.5-flash", "gemini-2.0-flash"];

  for (const model of models) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) return response;

      if (response.status === 429) {
        if (attempt < maxRetries) {
          const waitMs = attempt * 3000; // 3s, 6s, 9s
          console.log(`429 en ${model}, intento ${attempt}/${maxRetries}. Esperando ${waitMs}ms...`);
          await new Promise((res) => setTimeout(res, waitMs));
          continue;
        }
        // Agotamos reintentos en este modelo, probamos el siguiente
        console.log(`Agotados reintentos para ${model}, probando siguiente modelo...`);
        break;
      }

      // Otro tipo de error — lanzar inmediatamente
      const errText = await response.text();
      console.error(`Error en ${model}:`, response.status, errText);
      throw new Error("Error en la API de generación");
    }
  }

  // Si llegamos aquí, ambos modelos fallaron con 429
  throw new Error("RATE_LIMIT");
}

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

    const goalLabel =
      goal === "calls" ? "llamadas telefónicas" :
      goal === "sales" ? "ventas online" :
      goal === "bookings" ? "reservaciones" : "tráfico web";

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

    const geminiBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    };

    let geminiResponse: Response;
    try {
      geminiResponse = await callGeminiWithRetry(GEMINI_API_KEY, geminiBody);
    } catch (e) {
      if (e instanceof Error && e.message === "RATE_LIMIT") {
        return new Response(
          JSON.stringify({ error: "El servicio de IA está ocupado en este momento. Por favor intenta en 1-2 minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw e;
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

    // Si se está actualizando un anuncio existente
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
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
