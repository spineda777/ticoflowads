import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ad_id, business_type, description, target_audience, reference_images, style_instructions } = await req.json();

    if (!ad_id) {
      return new Response(JSON.stringify({ error: "ad_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const styleNote = style_instructions ? ` Style: ${style_instructions}.` : "";
    const baseContext = `Business type: ${business_type || "business"}. ${description || ""}. Target: ${target_audience || "general audience"}.${styleNote}`;

    const imagePrompts = [
      `Professional social media ad. ${baseContext} Modern, vibrant, clean, commercial quality, high resolution.`,
      `Eye-catching promotional banner. ${baseContext} Lifestyle shot, warm lighting, inviting, professional photography style.`,
      `Bold advertising creative. ${baseContext} Minimalist design, strong typography space, premium feel, social media optimized.`,
      `Dynamic promotional image. ${baseContext} Action-oriented, energetic, colorful, modern graphic design style.`,
      `Elegant brand advertisement. ${baseContext} Sophisticated, clean background, product-focused, Instagram-ready.`,
    ];

    const imageResults = [];
    const hasReferences = reference_images && reference_images.length > 0;

    for (let i = 0; i < imagePrompts.length; i++) {
      try {
        // Build parts for Gemini
        const parts: any[] = [];

        if (hasReferences) {
          parts.push({ text: `Using the provided reference images as inspiration, create: ${imagePrompts[i]} Incorporate the brand colors, style and elements from the references.` });
          for (const refUrl of reference_images) {
            try {
              const imgResp = await fetch(refUrl);
              if (imgResp.ok) {
                const imgBuffer = await imgResp.arrayBuffer();
                const base64 = btoa(String.fromCharCode(...new Uint8Array(imgBuffer)));
                const mimeType = imgResp.headers.get("content-type") || "image/png";
                parts.push({ inlineData: { mimeType, data: base64 } });
              }
            } catch (e) {
              console.error(`Failed to fetch reference image: ${refUrl}`, e);
            }
          }
        } else {
          parts.push({ text: imagePrompts[i] });
        }

        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: {
                responseModalities: ["TEXT", "IMAGE"],
              },
            }),
          }
        );

        if (!geminiResponse.ok) {
          console.error(`Image ${i} generation failed:`, geminiResponse.status);
          if (geminiResponse.status === 429) {
            await new Promise(r => setTimeout(r, 5000));
          }
          continue;
        }

        const geminiData = await geminiResponse.json();
        const candidateParts = geminiData.candidates?.[0]?.content?.parts || [];
        const imagePart = candidateParts.find((p: any) => p.inlineData);

        if (!imagePart?.inlineData) {
          console.error(`Image ${i}: no image in response`);
          continue;
        }

        const { mimeType, data: base64Data } = imagePart.inlineData;
        const ext = mimeType === "image/jpeg" ? "jpg" : "png";
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        const filePath = `${ad_id}/image_${i}_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("ad-images")
          .upload(filePath, binaryData, { contentType: mimeType, upsert: true });

        if (uploadError) {
          console.error(`Image ${i} upload error:`, uploadError);
          continue;
        }

        const { data: publicUrl } = supabase.storage.from("ad-images").getPublicUrl(filePath);

        const { error: insertError } = await supabase.from("ad_images").insert({
          ad_id,
          image_url: publicUrl.publicUrl,
          prompt: imagePrompts[i],
          selected: i === 0,
        });

        if (insertError) {
          console.error(`Image ${i} insert error:`, insertError);
          continue;
        }

        imageResults.push({ index: i, url: publicUrl.publicUrl });
        console.log(`Image ${i} generated and saved successfully`);

        if (i < imagePrompts.length - 1) {
          await new Promise(r => setTimeout(r, 3000));
        }
      } catch (imgErr) {
        console.error(`Image ${i} error:`, imgErr);
      }
    }

    return new Response(JSON.stringify({ success: true, images: imageResults, count: imageResults.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-ad-images error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
