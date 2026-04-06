
-- Campaign drafts table for Google Ads campaigns
CREATE TABLE public.campaign_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  
  -- Budget
  budget_monthly NUMERIC NOT NULL DEFAULT 500,
  budget_daily NUMERIC GENERATED ALWAYS AS (ROUND(budget_monthly / 30, 2)) STORED,
  budget_label TEXT,
  
  -- Goal & Targeting
  primary_goal TEXT NOT NULL DEFAULT 'calls',
  targeting_radius TEXT NOT NULL DEFAULT '15mi',
  
  -- Campaign content
  campaign_name TEXT,
  ad_title TEXT,
  ad_body TEXT,
  keywords TEXT[],
  
  -- AI variants (JSON array of 5 campaign options)
  variants JSONB DEFAULT '[]'::jsonb,
  selected_variant INTEGER,
  
  -- Status
  test_mode BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'draft',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaign_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own tenant drafts"
  ON public.campaign_drafts FOR SELECT
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can create drafts"
  ON public.campaign_drafts FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can update own tenant drafts"
  ON public.campaign_drafts FOR UPDATE
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can delete own tenant drafts"
  ON public.campaign_drafts FOR DELETE
  USING (tenant_id = get_user_tenant_id());

-- Timestamp trigger
CREATE TRIGGER update_campaign_drafts_updated_at
  BEFORE UPDATE ON public.campaign_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
