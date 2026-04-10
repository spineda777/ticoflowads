import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ad_id, business_type, description, target_audience, style_instructions } = await req.json();

    if (!ad_id) {
      return new Response(JSON.stringify({ error: "ad_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const styleNote = style_instructions ? ` ${style_instructions}` : "";
    const baseContext = `${business_type || "business"}: ${description || ""}. Target: ${target_audience || "general audience"}${styleNote}`;

    const imagePrompts = [
      `Professional social media advertisement for ${baseContext}. Modern, vibrant, clean design, high quality commercial style.`,
      `Eye-catching promotional banner for ${baseContext}. Warm lighting, inviting atmosphere, professional photography.`,
      `Bold advertising creative for ${baseContext}. Minimalist design, strong visual impact, premium feel.`,
      `Dynamic promotional image for ${baseContext}. Action-oriented, energetic colors, modern graphic style.`,
      `Elegant brand advertisement for ${baseContext}. Sophisticated, clean background, product showcase.`,
    ];

    const imageResults = [];

    for (let i = 0; i < imagePrompts.length; i++) {
      try {
        const encodedPrompt = encodeURIComponent(imagePrompts[i]);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

        const imgResponse = await fetch(imageUrl);
        if (!imgResponse.ok) {
          console.error(`Image ${i} fetch failed:`, imgResponse.status);
          continue;
        }

        const imgBuffer = await imgResponse.arrayBuffer();
        const filePath = `${ad_id}/image_${i}_${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from("ad-images")
          .upload(filePath, imgBuffer, { contentType: "image/png", upsert: true });

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
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
