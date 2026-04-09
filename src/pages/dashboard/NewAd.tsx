import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles, Loader2, Phone, MapPin, ChevronRight, Megaphone,
  ArrowRight, Target, Instagram, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const platformOptions = [
  { id: "meta", label: "Meta (Facebook & Instagram)", icon: Megaphone },
  { id: "tiktok", label: "TikTok", icon: Zap },
];

const goalSuggestions = [
  "Generar más mensajes por WhatsApp",
  "Llevar tráfico a mi sitio web",
  "Promocionar un descuento especial",
  "Dar a conocer mi marca en redes",
  "Aumentar seguidores en Instagram",
  "Promover un evento",
];

const NewAd = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [businessId, setBusinessId] = useState("");

  // Ad config
  const [platform, setPlatform] = useState("meta");
  const [objective, setObjective] = useState("");
  const [extraPhone, setExtraPhone] = useState("");
  const [extraAddress, setExtraAddress] = useState("");
  const [extraNotes, setExtraNotes] = useState("");
  const [showBuzon, setShowBuzon] = useState(false);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generatedAd, setGeneratedAd] = useState<any>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: p } = await supabase.from("profiles").select("tenant_id").eq("user_id", user.id).single();
      setProfile(p);
      if (p?.tenant_id) {
        const { data: b } = await supabase.from("businesses").select("*").eq("tenant_id", p.tenant_id);
        setBusinesses(b || []);
        if (b && b.length > 0) setBusinessId(b[0].id);
      }
    };
    load();
  }, [user]);

  const handleGenerate = async () => {
    if (!profile?.tenant_id || !user || !objective) {
      toast({ title: "Completa el objetivo", description: "Describe qué quieres lograr con este anuncio.", variant: "destructive" });
      return;
    }
    setGenerating(true);
    const business = businesses.find((b) => b.id === businessId);

    try {
      const { data, error } = await supabase.functions.invoke("generate-ads-v2", {
        body: {
          businessName: business?.name || "Mi negocio",
          description: business?.description || "",
          budget: 500,
          goal: objective,
          radius: "15mi",
          platform,
          generateVariants: false,
          extras: (extraPhone || extraAddress || extraNotes)
            ? { phone: extraPhone || undefined, address: extraAddress || undefined, extraNotes: extraNotes || undefined }
            : undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const variants = data.data?.variants || [];
      setGeneratedAd(variants[0] || null);
    } catch (err: any) {
      toast({ title: "Error al generar", description: err.message, variant: "destructive" });
    }
    setGenerating(false);
  };

  const handlePublish = async () => {
    if (!generatedAd || !profile?.tenant_id || !user) return;
    setPublishing(true);

    try {
      const { error } = await supabase.from("ads").insert({
        tenant_id: profile.tenant_id,
        user_id: user.id,
        business_id: businessId || null,
        ad_title: generatedAd.campaign_name || generatedAd.titles?.[0] || "Anuncio sin título",
        ad_body: generatedAd.descriptions?.[0] || "",
        call_to_action: objective,
        status: "ready",
        targeting: { platform, objective } as any,
      });

      if (error) throw error;
      toast({ title: "✅ Anuncio guardado (Test Mode)", description: "Tu anuncio fue creado. Conecta tu cuenta de Meta/TikTok para publicar en vivo." });
      navigate("/dashboard/ads");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setPublishing(false);
  };

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-t-primary animate-spin" />
          <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary" />
        </motion.div>
        <p className="text-lg font-medium">Generando anuncio para {platform === "meta" ? "Meta" : "TikTok"}...</p>
      </div>
    );
  }

  if (generatedAd) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="font-heading text-2xl font-bold">Vista previa del anuncio</h1>
        <Card className="border-primary/20">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{platform === "meta" ? "Meta Ads" : "TikTok Ads"}</span>
              <span className="bg-accent/10 text-accent-foreground px-2 py-0.5 rounded-full font-medium">Test Mode</span>
            </div>
            <h2 className="font-heading font-bold text-lg">{generatedAd.campaign_name || generatedAd.titles?.[0]}</h2>
            <p className="text-muted-foreground">{generatedAd.descriptions?.[0]}</p>
            {generatedAd.titles?.length > 1 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Variantes de texto</p>
                <div className="flex flex-wrap gap-1">
                  {generatedAd.titles?.slice(1, 4).map((t: string, i: number) => (
                    <span key={i} className="text-xs bg-muted px-2 py-1 rounded">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setGeneratedAd(null)} className="flex-1">← Volver a editar</Button>
          <Button onClick={handlePublish} disabled={publishing} className="flex-1 h-12">
            {publishing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</> : <>Publicar anuncio (Test Mode)</>}
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground">🔒 Modo test: el anuncio se guarda como borrador.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-2 bg-accent/10 text-accent-foreground rounded-full px-4 py-1.5 text-sm font-medium">
            <Megaphone className="h-4 w-4" /> Anuncios para Meta & TikTok
          </span>
        </motion.div>
        <h1 className="font-heading text-3xl font-bold">Crear nuevo anuncio</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          La IA generará un anuncio optimizado para {platform === "meta" ? "Facebook e Instagram" : "TikTok"} basado en tu objetivo.
        </p>
      </div>

      {/* Platform selector */}
      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Plataforma</h2>
        <div className="grid grid-cols-2 gap-3">
          {platformOptions.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                platform === p.id ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/40"
              }`}
            >
              <p.icon className="h-5 w-5 text-primary mb-2" />
              <p className="font-semibold text-sm">{p.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Business selector */}
      {businesses.length > 1 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Negocio</label>
          <select
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      )}

      {/* Objective */}
      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">¿Qué quieres lograr?</h2>
        <Input
          placeholder="Ej: Quiero más mensajes por WhatsApp para mi restaurante"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          className="text-base h-12"
        />
        <div className="flex flex-wrap gap-2">
          {goalSuggestions.map((s) => (
            <button
              key={s}
              onClick={() => setObjective(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                objective === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Buzón */}
      <div className="space-y-3">
        <button
          onClick={() => setShowBuzon(!showBuzon)}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          {showBuzon ? "Ocultar" : "Agregar"} datos extra para personalizar
          <ChevronRight className={`h-4 w-4 transition-transform ${showBuzon ? "rotate-90" : ""}`} />
        </button>
        <AnimatePresence>
          {showBuzon && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-5 space-y-4">
                  <p className="text-xs text-muted-foreground">
                    📬 <strong>Buzón de personalización:</strong> Agrega detalles para que la IA cree anuncios más relevantes.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium flex items-center gap-1"><Phone className="h-3 w-3" /> Teléfono</label>
                      <Input placeholder="Ej: +506 8888-8888" value={extraPhone} onChange={(e) => setExtraPhone(e.target.value)} className="text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium flex items-center gap-1"><MapPin className="h-3 w-3" /> Dirección</label>
                      <Input placeholder="Ej: San José, Costa Rica" value={extraAddress} onChange={(e) => setExtraAddress(e.target.value)} className="text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">📝 Notas adicionales</label>
                    <textarea
                      placeholder="Ej: Tenemos 15% de descuento. Horario: Lun-Vie 8am-5pm..."
                      value={extraNotes}
                      onChange={(e) => setExtraNotes(e.target.value)}
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Generate */}
      <Button onClick={handleGenerate} className="w-full h-14 text-lg" disabled={!objective}>
        <Sparkles className="h-5 w-5 mr-2" />
        Generar anuncio con IA
        <ArrowRight className="h-5 w-5 ml-2" />
      </Button>
    </div>
  );
};

export default NewAd;
