import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      setProfile(p);
      if (p?.tenant_id) {
        const { data: s } = await supabase.from("tenant_settings").select("*").eq("tenant_id", p.tenant_id).single();
        setSettings(s);
        const { data: b } = await supabase.from("businesses").select("*").eq("tenant_id", p.tenant_id).limit(1).single();
        setBusiness(b);
      }
    };
    load();
  }, [user]);

  const saveProfile = async () => {
    if (!profile) return;
    setLoading(true);
    await supabase.from("profiles").update({ full_name: profile.full_name }).eq("user_id", user!.id);
    toast({ title: "Perfil actualizado" });
    setLoading(false);
  };

  const saveSettings = async () => {
    if (!settings) return;
    setLoading(true);
    await supabase.from("tenant_settings").update({
      timezone: settings.timezone,
      currency: settings.currency,
      notifications_enabled: settings.notifications_enabled,
      ai_auto_publish: settings.ai_auto_publish,
    }).eq("id", settings.id);
    toast({ title: "Configuración guardada" });
    setLoading(false);
  };

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-heading text-2xl font-bold">Configuración</h1>

      <Card>
        <CardHeader><CardTitle>Perfil</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={profile.full_name || ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Correo</Label>
            <Input value={user?.email || ""} disabled />
          </div>
          <Button onClick={saveProfile} disabled={loading}>Guardar perfil</Button>
        </CardContent>
      </Card>

      {settings && (
        <Card>
          <CardHeader><CardTitle>Preferencias</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Zona horaria</Label>
              <Input value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Moneda</Label>
              <Input value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Notificaciones</Label>
              <Switch checked={settings.notifications_enabled} onCheckedChange={(v) => setSettings({ ...settings, notifications_enabled: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Auto-publicar con IA</Label>
              <Switch checked={settings.ai_auto_publish} onCheckedChange={(v) => setSettings({ ...settings, ai_auto_publish: v })} />
            </div>
            <Button onClick={saveSettings} disabled={loading}>Guardar configuración</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;
