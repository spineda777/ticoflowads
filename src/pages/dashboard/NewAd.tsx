import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";

const NewAd = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [form, setForm] = useState({
    businessId: "",
    objective: "",
    extraContext: "",
  });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: p } = await supabase.from("profiles").select("tenant_id").eq("user_id", user.id).single();
      setProfile(p);
      if (p?.tenant_id) {
        const { data: b } = await supabase.from("businesses").select("*").eq("tenant_id", p.tenant_id);
        setBusinesses(b || []);
        if (b && b.length > 0) setForm((f) => ({ ...f, businessId: b[0].id }));
      }
    };
    load();
  }, [user]);

  const handleGenerate = async () => {
    if (!profile?.tenant_id || !user) return;
    setLoading(true);

    const business = businesses.find((b) => b.id === form.businessId);

    // Check plan limits
    const { count } = await supabase
      .from("ads")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", profile.tenant_id);

    const { data: tenant } = await supabase.from("tenants").select("plan").eq("id", profile.tenant_id).single();
    const limits: Record<string, number> = { free: 3, starter: 20, pro: 9999, agency: 9999 };
    const limit = limits[tenant?.plan || "free"] || 3;

    if ((count || 0) >= limit) {
      toast({
        title: "Has alcanzado el límite de tu plan",
        description: "Actualiza tu suscripción para crear más anuncios.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Create ad entry
    const { data: ad, error } = await supabase.from("ads").insert({
      tenant_id: profile.tenant_id,
      business_id: form.businessId || null,
      user_id: user.id,
      status: "generating",
    }).select().single();

    if (error || !ad) {
      toast({ title: "Error", description: "No se pudo crear el anuncio", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Call AI edge function
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("generate-ad", {
        body: {
          adId: ad.id,
          businessName: business?.name || "Mi negocio",
          businessType: business?.type || "general",
          targetAudience: business?.target_audience || "",
          location: business?.location || "",
          objective: form.objective,
          extraContext: form.extraContext,
        },
      });

      if (fnError) throw fnError;

      toast({ title: "¡Anuncio generado!", description: "Ahora genera imágenes y segmentación." });
      navigate(`/dashboard/ads/${ad.id}`);
    } catch (err: any) {
      await supabase.from("ads").update({ status: "error", error_message: err.message }).eq("id", ad.id);
      toast({ title: "Error al generar", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-heading text-2xl font-bold">Crear anuncio con IA</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-accent" />
            Genera tu anuncio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {businesses.length > 0 && (
            <div className="space-y-2">
              <Label>Negocio</Label>
              <select
                value={form.businessId}
                onChange={(e) => setForm({ ...form, businessId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Objetivo del anuncio</Label>
            <Input
              value={form.objective}
              onChange={(e) => setForm({ ...form, objective: e.target.value })}
              placeholder="Ej: Atraer nuevos clientes para corte de cabello"
            />
          </div>

          <div className="space-y-2">
            <Label>Contexto adicional (opcional)</Label>
            <Textarea
              value={form.extraContext}
              onChange={(e) => setForm({ ...form, extraContext: e.target.value })}
              placeholder="Ej: Tenemos promoción 2x1 este mes, público joven 18-35"
              rows={3}
            />
          </div>

          <Button onClick={handleGenerate} className="w-full" disabled={loading || !form.objective}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generando con IA...</> : <><Sparkles className="h-4 w-4 mr-2" />Generar anuncio</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewAd;
