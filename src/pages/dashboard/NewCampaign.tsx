import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles, Loader2, Phone, ShoppingCart, CalendarCheck,
  MapPin, ChevronLeft, ChevronRight, Check, Zap, Rocket,
  TrendingUp, Crown, Target, Globe, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const budgetOptions = [
  { monthly: 500, label: "Getting started", icon: Zap },
  { monthly: 1000, label: "Growing", icon: Rocket },
  { monthly: 2500, label: "Scaling", icon: TrendingUp },
  { monthly: 5000, label: "Accelerating", icon: TrendingUp },
  { monthly: 10000, label: "Dominating", icon: Crown },
];

const goalOptions = [
  { id: "calls", label: "Llamadas", description: "Recibe más llamadas de clientes", icon: Phone },
  { id: "sales", label: "Ventas", description: "Aumenta ventas online", icon: ShoppingCart },
  { id: "bookings", label: "Reservas", description: "Más citas y reservaciones", icon: CalendarCheck },
];

const radiusOptions = [
  { value: "5mi", label: "5 mi" },
  { value: "10mi", label: "10 mi" },
  { value: "15mi", label: "15 mi" },
  { value: "25mi", label: "25 mi" },
  { value: "50mi", label: "50 mi" },
  { value: "nationwide", label: "Nacional" },
];

const loadingMessages = [
  "IA analizando tu nicho...",
  "Investigando keywords de alto rendimiento...",
  "Optimizando para Google Search...",
  "Generando variantes de campaña...",
  "Creando textos publicitarios...",
];

type CampaignVariant = {
  campaign_name: string;
  titles: string[];
  descriptions: string[];
  keywords: string[];
};

const NewCampaign = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(0); // 0=budget, 1=generating, 2=select variant
  const [profile, setProfile] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);

  // Budget & config
  const [selectedBudget, setSelectedBudget] = useState<number | null>(null);
  const [customBudget, setCustomBudget] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [primaryGoal, setPrimaryGoal] = useState("calls");
  const [radius, setRadius] = useState("15mi");
  const [businessId, setBusinessId] = useState("");

  // Buzón - datos extra para personalizar anuncios
  const [extraPhone, setExtraPhone] = useState("");
  const [extraAddress, setExtraAddress] = useState("");
  const [extraNotes, setExtraNotes] = useState("");
  const [showBuzon, setShowBuzon] = useState(false);

  // AI variants
  const [variants, setVariants] = useState<CampaignVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [publishing, setPublishing] = useState(false);

  const budget = isCustom ? Number(customBudget) : selectedBudget;
  const dailyBudget = budget ? Math.round((budget / 30) * 100) / 100 : 0;

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

  // Animate loading messages
  useEffect(() => {
    if (step !== 1) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [step]);

  const handleGenerate = async () => {
    if (!profile?.tenant_id || !user || !budget) return;
    setStep(1);
    setLoadingMsgIdx(0);

    const business = businesses.find((b) => b.id === businessId);

    try {
      const extras = {
        phone: extraPhone || undefined,
        address: extraAddress || undefined,
        extraNotes: extraNotes || undefined,
      };

      const { data, error } = await supabase.functions.invoke("generate-ads-v2", {
        body: {
          businessName: business?.name || "Mi negocio",
          description: business?.description || "",
          budget,
          goal: primaryGoal,
          radius,
          generateVariants: true,
          extras: (extraPhone || extraAddress || extraNotes) ? extras : undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setVariants(data.data?.variants || []);
      setSelectedVariant(0);
      setStep(2);
    } catch (err: any) {
      toast({ title: "Error al generar", description: err.message, variant: "destructive" });
      setStep(0);
    }
  };

  const handlePublish = async () => {
    if (selectedVariant === null || !profile?.tenant_id || !user) return;
    setPublishing(true);

    const variant = variants[selectedVariant];
    const business = businesses.find((b) => b.id === businessId);

    try {
      // Save as campaign draft in test_mode
      const { error } = await supabase.from("campaign_drafts").insert({
        tenant_id: profile.tenant_id,
        user_id: user.id,
        business_id: businessId || null,
        budget_monthly: budget || 500,
        budget_label: isCustom ? "Custom" : budgetOptions.find(o => o.monthly === selectedBudget)?.label || "",
        primary_goal: primaryGoal,
        targeting_radius: radius,
        campaign_name: variant.campaign_name,
        ad_title: variant.titles?.[0] || "",
        ad_body: variant.descriptions?.[0] || "",
        keywords: variant.keywords || [],
        variants: variants as any,
        selected_variant: selectedVariant,
        test_mode: true,
        status: "published_test",
      });

      if (error) throw error;

      toast({
        title: "🚀 Campaña guardada en modo test",
        description: "Tu campaña fue creada exitosamente. Conecta Google Ads para publicar en vivo.",
      });
      navigate("/dashboard/campaigns");
    } catch (err: any) {
      toast({ title: "Error al guardar", description: err.message, variant: "destructive" });
    }
    setPublishing(false);
  };

  // Step 0: Budget & Goal selection
  if (step === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Crear campaña de Google Ads</h1>
          <p className="text-muted-foreground mt-1">Configura tu presupuesto, objetivo y deja que la IA haga el resto.</p>
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
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Budget Grid */}
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Presupuesto mensual
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {budgetOptions.map((opt) => (
              <button
                key={opt.monthly}
                onClick={() => { setSelectedBudget(opt.monthly); setIsCustom(false); }}
                className={`relative p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                  !isCustom && selectedBudget === opt.monthly
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {!isCustom && selectedBudget === opt.monthly && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <opt.icon className="h-5 w-5 text-primary mb-2" />
                <p className="text-xl font-bold">${opt.monthly.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                <p className="text-xs text-muted-foreground mt-1">${Math.round(opt.monthly / 30)}/day</p>
                <p className="text-xs text-primary font-medium mt-1">{opt.label}</p>
              </button>
            ))}
            {/* Custom */}
            <button
              onClick={() => { setIsCustom(true); setSelectedBudget(null); }}
              className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                isCustom ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/40"
              }`}
            >
              {isCustom && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                  <Check className="h-3 w-3" />
                </div>
              )}
              <Globe className="h-5 w-5 text-primary mb-2" />
              <p className="text-lg font-bold">Custom</p>
              <p className="text-xs text-muted-foreground mt-1">Tu monto ideal</p>
            </button>
          </div>
          <AnimatePresence>
            {isCustom && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-lg font-bold">$</span>
                  <Input
                    type="number"
                    placeholder="Ej: 750"
                    value={customBudget}
                    onChange={(e) => setCustomBudget(e.target.value)}
                    className="max-w-[200px] text-lg font-bold"
                    min={100}
                  />
                  <span className="text-muted-foreground text-sm">/mes</span>
                  {Number(customBudget) > 0 && (
                    <span className="text-xs text-primary font-medium">≈ ${Math.round(Number(customBudget) / 30)}/day</span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Primary Goal */}
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-semibold">Objetivo principal</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {goalOptions.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setPrimaryGoal(goal.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                  primaryGoal === goal.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${primaryGoal === goal.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <goal.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{goal.label}</p>
                    <p className="text-xs text-muted-foreground">{goal.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Radius */}
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Radio de segmentación
          </h2>
          <div className="flex flex-wrap gap-2">
            {radiusOptions.map((r) => (
              <button
                key={r.value}
                onClick={() => setRadius(r.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  radius === r.value
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Buzón - Datos extra para personalizar */}
        <div className="space-y-3">
          <button
            onClick={() => setShowBuzon(!showBuzon)}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            {showBuzon ? "Ocultar" : "Agregar"} datos extra para personalizar tus anuncios
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
                      📬 <strong>Buzón de personalización:</strong> Agrega detalles específicos para que la IA cree anuncios más relevantes para tu negocio.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium flex items-center gap-1">
                          <Phone className="h-3 w-3" /> Teléfono de contacto
                        </label>
                        <Input
                          placeholder="Ej: +506 8888-8888"
                          value={extraPhone}
                          onChange={(e) => setExtraPhone(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> Dirección física
                        </label>
                        <Input
                          placeholder="Ej: San José, Costa Rica"
                          value={extraAddress}
                          onChange={(e) => setExtraAddress(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">📝 Notas adicionales para la IA</label>
                      <textarea
                        placeholder="Ej: Tenemos 15% de descuento este mes. Horario: Lun-Vie 8am-5pm. Ofrecemos envío gratis..."
                        value={extraNotes}
                        onChange={(e) => setExtraNotes(e.target.value)}
                        rows={3}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      />
                      <p className="text-[10px] text-muted-foreground">La IA usará estos datos para crear anuncios más específicos y relevantes.</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          className="w-full h-14 text-lg"
          disabled={!budget || budget < 100}
        >
          <Sparkles className="h-5 w-5 mr-2" />
          Generar 5 campañas con IA
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    );
  }

  // Step 1: Loading animation
  if (step === 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <div className="h-20 w-20 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-t-primary animate-spin" />
          <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary" />
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.p
            key={loadingMsgIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg font-medium text-center"
          >
            {loadingMessages[loadingMsgIdx]}
          </motion.p>
        </AnimatePresence>
        <div className="flex gap-1">
          {loadingMessages.map((_, i) => (
            <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${i <= loadingMsgIdx ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Select variant
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Elige tu campaña favorita</h1>
          <p className="text-muted-foreground mt-1">La IA generó {variants.length} variantes. Elige la que mejor represente tu negocio.</p>
        </div>
        <Button variant="outline" onClick={() => { setStep(0); setVariants([]); }}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Volver
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {variants.map((v, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedVariant === idx
                  ? "border-primary ring-2 ring-primary/30 shadow-lg"
                  : "border-border hover:border-primary/40"
              }`}
              onClick={() => setSelectedVariant(idx)}
            >
              <CardContent className="pt-5 space-y-3 relative">
                {selectedVariant === idx && (
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Variante {idx + 1}</span>
                </div>
                <h3 className="font-heading font-bold text-base leading-tight">{v.campaign_name}</h3>

                {/* Google Ad Preview */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 border border-border">
                  <p className="text-xs text-muted-foreground">Vista previa de Google Search</p>
                  <p className="text-primary text-sm font-medium leading-snug">{v.titles?.[0]}</p>
                  <p className="text-xs text-accent">www.tunegocio.com</p>
                  <p className="text-xs text-foreground/80 leading-relaxed">{v.descriptions?.[0]}</p>
                </div>

                {/* Titles */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Titulares ({v.titles?.length || 0})</p>
                  <div className="flex flex-wrap gap-1">
                    {v.titles?.slice(0, 3).map((t, i) => (
                      <span key={i} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                    {(v.titles?.length || 0) > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{(v.titles?.length || 0) - 3} más</span>
                    )}
                  </div>
                </div>

                {/* Keywords */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Keywords ({v.keywords?.length || 0})</p>
                  <div className="flex flex-wrap gap-1">
                    {v.keywords?.slice(0, 4).map((k, i) => (
                      <span key={i} className="text-[10px] bg-accent/10 text-accent-foreground px-1.5 py-0.5 rounded">{k}</span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Budget summary */}
      <Card className="bg-muted/30">
        <CardContent className="pt-5">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div><span className="text-muted-foreground">Presupuesto:</span> <span className="font-bold">${budget?.toLocaleString()}/mes</span> <span className="text-muted-foreground">(${dailyBudget}/día)</span></div>
            <div><span className="text-muted-foreground">Objetivo:</span> <span className="font-bold capitalize">{goalOptions.find(g => g.id === primaryGoal)?.label}</span></div>
            <div><span className="text-muted-foreground">Radio:</span> <span className="font-bold">{radiusOptions.find(r => r.value === radius)?.label}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handleGenerate} className="flex-1">
          <Sparkles className="h-4 w-4 mr-2" /> Regenerar variantes
        </Button>
        <Button
          onClick={handlePublish}
          disabled={selectedVariant === null || publishing}
          className="flex-1 h-12"
        >
          {publishing ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</>
          ) : (
            <><Rocket className="h-4 w-4 mr-2" /> Publicar campaña (Test Mode)</>
          )}
        </Button>
      </div>
      <p className="text-xs text-center text-muted-foreground">
        🔒 Modo test: la campaña se guarda como borrador. Conecta tu cuenta de Google Ads para publicar en vivo.
      </p>
    </div>
  );
};

export default NewCampaign;
