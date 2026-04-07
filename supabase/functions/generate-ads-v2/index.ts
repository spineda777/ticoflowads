// v4 - mock mode for testing
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cambiar a false cuando tengas créditos en Anthropic
const MOCK_MODE = true;

function generateMockResponse(businessName: string, goal: string, variantCount: number) {
  const goalTexts: Record<string, string> = {
    calls: "Llámanos Hoy",
    sales: "Compra Ahora",
    bookings: "Reserva Ya",
    traffic: "Visítanos",
  };
  const cta = goalTexts[goal] || "Contáctanos";

  const approaches = ["Precio", "Beneficios", "Urgencia", "Autoridad", "Emocional"];

  const variants = Array.from({ length: variantCount }, (_, i) => ({
    campaign_name: `${businessName} - Campaña ${approaches[i % approaches.length]}`,
    titles: [
      `${businessName} - ${cta}`,
      `Mejor ${businessName} de la Zona`,
      `${businessName} Profesional`,
      `Servicio de ${businessName}`,
      `${businessName} - Calidad Total`,
    ],
    descriptions: [
      `Descubre los mejores servicios de ${businessName}. ${cta} y obtén resultados garantizados.`,
      `${businessName} con años de experiencia. Atención personalizada y precios competitivos.`,
      `¿Buscas ${businessName} confiable? Somos tu mejor opción. Contáctanos hoy mismo.`,
      `Expertos en ${businessName}. Resultados comprobados. Solicita tu consulta gratuita ahora.`,
    ],
    keywords: [
      businessName.toLowerCase(),
      `${businessName.toLowerCase()} precio`,
      `${businessName.toLowerCase()} cerca de mí`,
      `mejor ${businessName.toLowerCase()}`,
      `${businessName.toLowerCase()} profesional`,
      `${businessName.toLowerCase()} servicio`,
      `contratar ${businessName.toLowerCase()}`,
      `${businessName.toLowerCase()} económico`,
      `${businessName.toLowerCase()} confiable`,
      `${businessName.toLowerCase()} experto`,
    ],
  }));

  return { variants };
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

    const variantCount = generateVariants ? 5 : 1;
    let googleAdsContent;

    if (MOCK_MODE) {
      // Simular delay de IA para que se vea realista
      await new Promise((res) => setTimeout(res, 2000));
      googleAdsContent = generateMockResponse(businessName, goal, variantCount);
    } else {
      const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
      if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");

      const goalLabel =
        goal === "calls" ? "llamadas telefónicas" :
        goal === "sales" ? "ventas online" :
        goal === "bookings" ? "reservaciones" : "tráfico web";

      const prompt = `Eres un experto en Google Ads para negocios en Latinoamérica.
Negocio: ${businessName}
${description ? `Descripción: ${description}` : ""}
${budget ? `Presupuesto mensual: $${budget}` : ""}
Objetivo principal: ${goalLabel}
${radius ? `Radio de segmentación: ${radius}` : ""}

Genera ${variantCount} variantes DISTINTAS de campaña optimizadas para Google Ads (Search).
Cada variante debe tener un enfoque diferente (precio, beneficios, urgencia, autoridad, emocional).

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta, sin texto adicional, sin backticks:
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
Restricciones: 5 títulos (máx 30 chars), 4 descripciones (máx 90 chars), 10 keywords relevantes.`;

      const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2048,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!anthropicResponse.ok) {
        const errText = await anthropicResponse.text();
        console.error("Anthropic error:", anthropicResponse.status, errText);
        throw new Error("Error en la API de generación");
      }

      const anthropicData = await anthropicResponse.json();
      const content = anthropicData.content?.[0]?.text || "";

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        googleAdsContent = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch {
        throw new Error("No se pudo procesar la respuesta de IA");
      }
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
