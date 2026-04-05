
-- Create ad_images table
CREATE TABLE public.ad_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT,
  prompt TEXT,
  selected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ad_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ad images in own tenant"
ON public.ad_images FOR SELECT
USING (
  ad_id IN (SELECT id FROM public.ads WHERE tenant_id = public.get_user_tenant_id())
);

CREATE POLICY "Users can insert ad images in own tenant"
ON public.ad_images FOR INSERT
WITH CHECK (
  ad_id IN (SELECT id FROM public.ads WHERE tenant_id = public.get_user_tenant_id())
);

CREATE POLICY "Users can update ad images in own tenant"
ON public.ad_images FOR UPDATE
USING (
  ad_id IN (SELECT id FROM public.ads WHERE tenant_id = public.get_user_tenant_id())
);

-- Add targeting and published_at columns to ads
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS targeting JSONB DEFAULT '{}';
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Create storage bucket for ad images
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-images', 'ad-images', true);

-- Storage policies
CREATE POLICY "Anyone can view ad images"
ON storage.objects FOR SELECT
USING (bucket_id = 'ad-images');

CREATE POLICY "Authenticated users can upload ad images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ad-images' AND auth.role() = 'authenticated');
