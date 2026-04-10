import type { VercelRequest, VercelResponse } from '@vercel/node';

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
5. Guiarte paso a paso en cualquier proceso de la plataforma

Planes disponibles:
- Free: 3 campañas, 1 negocio
- Starter ($29/mes): 20 campañas, 3 negocios, métricas
- Pro ($79/mes): campañas ilimitadas, auto-publicación Google Ads, IA premium, 10 negocios
- Agencia ($199/mes): todo Pro + clientes ilimitados, white-label, API

Contexto de datos del usuario (si está disponible):
{USER_CONTEXT}

Responde siempre en español. Sé conciso (máximo 3-4 párrafos). Si no sabes algo específico de la cuenta del usuario, pídele que lo verifique en la sección correspondiente del dashboard.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, userContext } = req.body;

    // Build system prompt with user context if available
    let systemPrompt = SYSTEM_PROMPT;
    if (userContext) {
      const contextStr = `
- Campañas activas: ${userContext.campaigns || 'No disponible'}
- Plan actual: ${userContext.plan || 'Free'}
- Negocios registrados: ${userContext.businesses || 'No disponible'}
- Métricas recientes: ${userContext.metrics || 'No disponible'}`;
      systemPrompt = SYSTEM_PROMPT.replace('{USER_CONTEXT}', contextStr);
    } else {
      systemPrompt = SYSTEM_PROMPT.replace('{USER_CONTEXT}', 'No hay datos del usuario disponibles.');
    }

    // Use AI Gateway - Anthropic Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: systemPrompt,
        messages: messages || [],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      throw new Error('Error en la API de IA');
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Lo siento, no pude generar una respuesta.';

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('toby-chat error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
}
