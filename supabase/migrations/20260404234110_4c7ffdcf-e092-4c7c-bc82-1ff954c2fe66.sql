
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  tenant_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Tenants table
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_user_id UUID,
  plan TEXT NOT NULL DEFAULT 'free',
  trial_ends_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Add FK from profiles to tenants
ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;

-- Subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Tenant settings
CREATE TABLE public.tenant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,
  timezone TEXT NOT NULL DEFAULT 'America/Costa_Rica',
  currency TEXT NOT NULL DEFAULT 'USD',
  business_hours JSONB DEFAULT '{}',
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  ai_auto_publish BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;

-- Staff members
CREATE TABLE public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

-- Businesses
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  description TEXT,
  location TEXT,
  target_audience TEXT,
  daily_budget NUMERIC DEFAULT 0,
  whatsapp TEXT,
  email TEXT,
  meta_ad_account_id TEXT,
  meta_access_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Ads
CREATE TABLE public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  ad_title TEXT,
  ad_body TEXT,
  call_to_action TEXT,
  suggested_targeting TEXT,
  status TEXT NOT NULL DEFAULT 'generating',
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  spend NUMERIC NOT NULL DEFAULT 0,
  error_message TEXT,
  meta_campaign_id TEXT,
  meta_adset_id TEXT,
  meta_ad_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's tenant_id
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()
$$;

-- Helper function to get user's staff role
CREATE OR REPLACE FUNCTION public.get_user_role(_tenant_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.staff_members WHERE user_id = auth.uid() AND tenant_id = _tenant_id
  UNION ALL
  SELECT 'owner' FROM public.tenants WHERE id = _tenant_id AND owner_user_id = auth.uid()
  LIMIT 1
$$;

-- RLS: profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS: tenants
CREATE POLICY "Users can view own tenant" ON public.tenants FOR SELECT USING (
  id = public.get_user_tenant_id() OR owner_user_id = auth.uid()
);
CREATE POLICY "Owner can update tenant" ON public.tenants FOR UPDATE USING (owner_user_id = auth.uid());

-- RLS: subscriptions
CREATE POLICY "Users can view own tenant subscriptions" ON public.subscriptions FOR SELECT USING (tenant_id = public.get_user_tenant_id());

-- RLS: tenant_settings
CREATE POLICY "Users can view own tenant settings" ON public.tenant_settings FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Owner/admin can update settings" ON public.tenant_settings FOR UPDATE USING (
  public.get_user_role(tenant_id) IN ('owner', 'admin')
);

-- RLS: staff_members
CREATE POLICY "Users can view staff in own tenant" ON public.staff_members FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Owner/admin can manage staff" ON public.staff_members FOR INSERT WITH CHECK (
  public.get_user_role(tenant_id) IN ('owner', 'admin')
);
CREATE POLICY "Owner/admin can update staff" ON public.staff_members FOR UPDATE USING (
  public.get_user_role(tenant_id) IN ('owner', 'admin')
);
CREATE POLICY "Owner/admin can delete staff" ON public.staff_members FOR DELETE USING (
  public.get_user_role(tenant_id) IN ('owner', 'admin')
);

-- RLS: businesses
CREATE POLICY "Users can view own tenant businesses" ON public.businesses FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Users can create businesses" ON public.businesses FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Users can update own tenant businesses" ON public.businesses FOR UPDATE USING (tenant_id = public.get_user_tenant_id());

-- RLS: ads
CREATE POLICY "Users can view own tenant ads" ON public.ads FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Users can create ads" ON public.ads FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Users can update own tenant ads" ON public.ads FOR UPDATE USING (tenant_id = public.get_user_tenant_id());

-- RLS: notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tenant_id UUID;
  user_name TEXT;
  tenant_slug TEXT;
BEGIN
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  tenant_slug := lower(regexp_replace(user_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substr(NEW.id::text, 1, 8);

  -- Create tenant
  INSERT INTO public.tenants (name, slug, owner_user_id, plan, trial_ends_at)
  VALUES (user_name || '''s Business', tenant_slug, NEW.id, 'free', now() + interval '7 days')
  RETURNING id INTO new_tenant_id;

  -- Create profile
  INSERT INTO public.profiles (user_id, full_name, tenant_id)
  VALUES (NEW.id, user_name, new_tenant_id);

  -- Create default settings
  INSERT INTO public.tenant_settings (tenant_id) VALUES (new_tenant_id);

  -- Create staff entry as owner
  INSERT INTO public.staff_members (tenant_id, user_id, role, permissions)
  VALUES (new_tenant_id, NEW.id, 'owner', '{"all": true}');

  -- Welcome notification
  INSERT INTO public.notifications (tenant_id, user_id, title, message)
  VALUES (new_tenant_id, NEW.id, '¡Bienvenido a TicoFlowAds!', 'Tu cuenta está lista. Comienza creando tu primer anuncio con IA.');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
