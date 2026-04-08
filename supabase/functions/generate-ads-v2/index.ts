import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Test mode: uses mock data. Set to false to use Lovable AI.
const MOCK_MODE = true;

function generateMockResponse(businessName: string, goal: string, variantCount: number, extras?: any) {
  const goalTexts: Record<string, string> = {
    calls: "Llámanos Hoy",
    sales: "Compra Ahora",
    bookings: "Reserva Ya",
    traffic: "Visítanos",
  };
  const cta = goalTexts[goal] || "Contáctanos";
  const approaches = ["Precio", "Beneficios", "Urgencia", "Autoridad", "Emocional"];

  const phoneExt = extras?.phone ? ` | Tel: ${extras.phone}` : "";
  const addressExt = extras?.address ? ` | ${extras.address}` : "";

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
      `Descubre los mejores servicios de ${businessName}. ${cta} y obtén resultados garantizados.${phoneExt}`,
      `${businessName} con años de experiencia. Atención personalizada y precios competitivos.${addressExt}`,
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
    extensions: {
      phone: extras?.phone || null,
      address: extras?.address || null,
      sitelinks: extras?.sitelinks || [],
      callouts: extras?.callouts || [],
      extra_notes: extras?.extraNotes || null,
    },
  }));

  return { variants };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { businessName, description, budget, goal, radius, adId, generateVariants, extras } = await req.json();

    if (!businessName) {
      return new Response(JSON.stringify({ error: "businessName es requerido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const variantCount = generateVariants ? 5 : 1;
    let googleAdsContent;

    if (MOCK_MODE) {
      await new Promise((res) => setTimeout(res, 2000));
      googleAdsContent = generateMockResponse(businessName, goal, variantCount, extras);
    } else {
      // Use Lovable AI Gateway
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

      const goalLabel =
        goal === "calls" ? "llamadas telefónicas" :
        goal === "sales" ? "ventas online" :
        goal === "bookings" ? "reservaciones" : "tráfico web";

      const extrasPrompt = extras ? `
Datos adicionales del cliente:
${extras.phone ? `- Teléfono: ${extras.phone}` : ""}
${extras.address ? `- Dirección: ${extras.address}` : ""}
${extras.callouts ? `- Callouts: ${extras.callouts.join(", ")}` : ""}
${extras.extraNotes ? `- Notas adicionales: ${extras.extraNotes}` : ""}
Incorpora estos datos en las extensiones y descripciones del anuncio.` : "";

      const prompt = `Eres un experto en Google Ads para negocios en Latinoamérica.
Negocio: ${businessName}
${description ? `Descripción: ${description}` : ""}
${budget ? `Presupuesto mensual: $${budget}` : ""}
Objetivo principal: ${goalLabel}
${radius ? `Radio de segmentación: ${radius}` : ""}
${extrasPrompt}

Genera ${variantCount} variantes DISTINTAS de campaña optimizadas para Google Ads (Search).
Cada variante debe tener un enfoque diferente (precio, beneficios, urgencia, autoridad, emocional).

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta, sin texto adicional, sin backticks:
{
  "variants": [
    {
      "campaign_name": "Nombre creativo de la campaña",
      "titles": ["título1", "título2", "título3", "título4", "título5"],
      "descriptions": ["desc1", "desc2", "desc3", "desc4"],
      "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5", "kw6", "kw7", "kw8", "kw9", "kw10"],
      "extensions": { "phone": "...", "address": "...", "callouts": ["..."], "extra_notes": "..." }
    }
  ]
}
Restricciones: 5 títulos (máx 30 chars), 4 descripciones (máx 90 chars), 10 keywords relevantes.`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Límite de solicitudes excedido, intenta más tarde." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aiResponse.status === 402) {
          return new Response(JSON.stringify({ error: "Créditos agotados. Contacta soporte." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errText = await aiResponse.text();
        console.error("AI gateway error:", aiResponse.status, errText);
        throw new Error("Error en la API de generación");
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || "";

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        googleAdsContent = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch {
        throw new Error("No se pudo procesar la respuesta de IA");
      }
    }

    // Update existing ad if adId provided
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
    console.error("generate-ads-v2 error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
