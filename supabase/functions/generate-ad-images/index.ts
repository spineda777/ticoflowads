import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ad_id, business_type, description, target_audience } = await req.json();

    if (!ad_id) {
      return new Response(JSON.stringify({ error: "ad_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const imagePrompts = [
      `Professional social media ad for a ${business_type || "business"}. ${description || ""}. Target: ${target_audience || "general audience"}. Modern, vibrant, clean, commercial quality, bright colors, high resolution.`,
      `Eye-catching promotional banner for ${business_type || "business"}. ${description || ""}. Lifestyle shot, warm lighting, inviting, professional photography style.`,
      `Bold advertising creative for ${business_type || "business"}. ${description || ""}. Minimalist design, strong typography space, premium feel, social media optimized.`,
      `Dynamic promotional image for ${business_type || "business"}. ${description || ""}. Action-oriented, energetic, colorful, modern graphic design style.`,
      `Elegant brand advertisement for ${business_type || "business"}. ${description || ""}. Sophisticated, clean background, product-focused, Instagram-ready.`,
    ];

    const imageResults = [];

    for (let i = 0; i < imagePrompts.length; i++) {
      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3.1-flash-image-preview",
            messages: [{ role: "user", content: imagePrompts[i] }],
            modalities: ["image", "text"],
          }),
        });

        if (!aiResponse.ok) {
          console.error(`Image ${i} generation failed:`, aiResponse.status);
          if (aiResponse.status === 429) {
            // Wait and retry once
            await new Promise(r => setTimeout(r, 5000));
            continue;
          }
          continue;
        }

        const aiData = await aiResponse.json();
        const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!imageUrl) {
          console.error(`Image ${i}: no image in response`);
          continue;
        }

        // Extract base64 data and upload to storage
        const base64Match = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!base64Match) {
          console.error(`Image ${i}: unexpected image format`);
          continue;
        }

        const ext = base64Match[1] === "jpeg" ? "jpg" : base64Match[1];
        const base64Data = base64Match[2];
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        const filePath = `${ad_id}/image_${i}_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("ad-images")
          .upload(filePath, binaryData, { contentType: `image/${base64Match[1]}`, upsert: true });

        if (uploadError) {
          console.error(`Image ${i} upload error:`, uploadError);
          continue;
        }

        const { data: publicUrl } = supabase.storage.from("ad-images").getPublicUrl(filePath);

        // Save to ad_images table
        const { error: insertError } = await supabase.from("ad_images").insert({
          ad_id,
          image_url: publicUrl.publicUrl,
          prompt: imagePrompts[i],
          selected: i === 0, // First image selected by default
        });

        if (insertError) {
          console.error(`Image ${i} insert error:`, insertError);
          continue;
        }

        imageResults.push({ index: i, url: publicUrl.publicUrl });
        console.log(`Image ${i} generated and saved successfully`);

        // Small delay between generations to avoid rate limits
        if (i < imagePrompts.length - 1) {
          await new Promise(r => setTimeout(r, 2000));
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
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
