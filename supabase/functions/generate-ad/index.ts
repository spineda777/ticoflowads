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
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const prompt = `Eres un experto en marketing digital y Meta Ads para negocios en Latinoamérica.

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
  "ad_body": "Texto principal del anuncio (máximo 125 caracteres)",
  "call_to_action": "Texto del botón CTA",
  "suggested_targeting": "Descripción breve de la segmentación recomendada"
}

El anuncio debe ser en español, atractivo, con urgencia y relevante para el mercado latinoamericano.`;

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
        return new Response(JSON.stringify({ error: "Límite de solicitudes alcanzado. Intenta más tarde." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Gemini API error");
    }

    const geminiData = await geminiResponse.json();
    const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

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
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
