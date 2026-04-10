import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: string;
  parts: { text: string }[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, context, history, userEmail } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemInstruction = `${context}

Instrucciones adicionales:
- Si el usuario pregunta sobre precios o planes, sé específico con los números.
- Si no tienes información, sugiere contactar al soporte.
- Mantén respuestas cortas y útiles (máximo 3-4 párrafos).
- Usa emojis de forma moderada y amigable.
- Si el usuario tiene problemas técnicos, ofrece soluciones prácticas.`;

    const contents: { role: string; parts: { text: string }[] }[] = history?.length > 0
      ? history.map((m: Message) => ({ role: m.role, parts: m.parts }))
      : [];

    contents.push({ role: "user", parts: [{ text: message }] });

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini error:", errorText);
      return new Response(JSON.stringify({ response: "Lo siento, estoy teniendo problemas técnicos. Por favor intenta de nuevo." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
                         "Lo siento, no pude generar una respuesta. ¿Puedes reformular tu pregunta?";

    return new Response(JSON.stringify({ response: responseText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Toby chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
