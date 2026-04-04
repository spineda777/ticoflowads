import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { adId, businessName, businessType, targetAudience, location, objective, extraContext } = await req.json();

    if (!adId || !objective) {
      return new Response(JSON.stringify({ error: "adId and objective are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `Eres un experto en marketing digital y Meta Ads (Facebook e Instagram) para negocios en Latinoamérica.

Genera un anuncio publicitario para:
- Negocio: ${businessName}
- Tipo: ${businessType}
- Ubicación: ${location}
- Audiencia objetivo: ${targetAudience}
- Objetivo del anuncio: ${objective}
${extraContext ? `- Contexto adicional: ${extraContext}` : ""}

Responde SOLO en formato JSON con esta estructura exacta:
{
  "ad_title": "Título del anuncio (máximo 40 caracteres)",
  "ad_body": "Texto principal del anuncio (máximo 125 caracteres para mejor rendimiento)",
  "call_to_action": "Texto del botón CTA (ej: Comprar ahora, Más información, Enviar mensaje)",
  "suggested_targeting": "Descripción breve de la segmentación recomendada"
}

El anuncio debe ser en español, atractivo, con urgencia y relevante para el mercado latinoamericano.`;

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
        return new Response(JSON.stringify({ error: "Límite de solicitudes alcanzado. Intenta más tarde." }), {
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

    // Parse JSON from response
    let adContent;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      adContent = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      adContent = {
        ad_title: "Anuncio para " + businessName,
        ad_body: content.slice(0, 125),
        call_to_action: "Más información",
        suggested_targeting: "Audiencia general",
      };
    }

    // Update ad in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase.from("ads").update({
      ad_title: adContent.ad_title,
      ad_body: adContent.ad_body,
      call_to_action: adContent.call_to_action,
      suggested_targeting: adContent.suggested_targeting,
      status: "ready",
    }).eq("id", adId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, ad: adContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-ad error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
