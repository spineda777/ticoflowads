// toby-chat v1
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres Toby, el asistente inteligente y amigable de TicoFlowAds — una plataforma SaaS que automatiza la creación de campañas de Google Ads con IA para negocios latinoamericanos.

Tu personalidad:
- Amigable, claro y directo. Usas un tono conversacional en español latinoamericano.
- Experto en Google Ads, marketing digital y la plataforma TicoFlowAds.
- Proactivo: siempre ofreces el siguiente paso o acción concreta.
- Usas emojis con moderación para dar calidez.

Lo que puedes hacer:
1. Explicar cómo usar TicoFlowAds (crear campañas, ver métricas, gestionar negocios, facturación)
2. Dar consejos de Google Ads (keywords, presupuestos, objetivos, segmentación)
3. Ayudar a elegir el plan correcto (Free, Starter $29/mes, Pro $79/mes, Agencia $199/mes)
4. Resolver dudas generales de marketing digital para negocios en Latinoamérica
5. Guiar paso a paso en cualquier proceso de la plataforma

Planes disponibles:
- Free: 3 campañas, 1 negocio
- Starter ($29/mes): 20 campañas, 3 negocios, métricas
- Pro ($79/mes): campañas ilimitadas, auto-publicación Google Ads, IA premium, 10 negocios
- Agencia ($199/mes): todo Pro + clientes ilimitados, white-label, API

Responde siempre en español. Sé conciso (máximo 3-4 párrafos). Si no sabes algo específico de la cuenta del usuario, pídele que lo verifique en la sección correspondiente del dashboard.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: messages || [],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic error:", err);
      throw new Error("Error en la API de IA");
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "Lo siento, no pude generar una respuesta.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("toby-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
