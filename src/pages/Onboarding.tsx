import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ticoflowLogo from "@/assets/ticoflow-logo.png";

const businessTypes = [
  { value: "salon", label: "Salón de belleza / Barbería" },
  { value: "restaurant", label: "Restaurante / Cafetería" },
  { value: "store", label: "Tienda / E-commerce" },
  { value: "services", label: "Servicios profesionales" },
  { value: "health", label: "Salud / Bienestar" },
  { value: "education", label: "Educación / Cursos" },
  { value: "other", label: "Otro" },
];

const countries = [
  "Costa Rica", "México", "Colombia", "Argentina", "Chile", "Perú",
  "Ecuador", "Guatemala", "Honduras", "El Salvador", "Panamá",
  "República Dominicana", "Estados Unidos", "España", "Otro",
];

const goals = [
  "Conseguir más clientes",
  "Aumentar ventas online",
  "Generar reconocimiento de marca",
  "Promocionar un evento",
  "Lanzar un producto nuevo",
];

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    businessName: "",
    businessType: "",
    country: "",
    goal: "",
    whatsapp: "",
  });

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);

    // Get tenant
    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("user_id", user.id)
      .single();

    if (profile?.tenant_id) {
      // Update tenant name
      await supabase.from("tenants").update({ name: data.businessName }).eq("id", profile.tenant_id);

      // Create business
      await supabase.from("businesses").insert({
        tenant_id: profile.tenant_id,
        name: data.businessName,
        type: data.businessType,
        location: data.country,
        target_audience: data.goal,
        whatsapp: data.whatsapp,
      });
    }

    toast({ title: "¡Configuración completa!", description: "Tu negocio está listo." });
    navigate("/dashboard");
    setLoading(false);
  };

  const steps = [
    // Step 0: Business name & type
    <div key={0} className="space-y-4">
      <h2 className="font-heading text-xl font-bold">¿Cómo se llama tu negocio?</h2>
      <div className="space-y-2">
        <Label>Nombre del negocio</Label>
        <Input value={data.businessName} onChange={(e) => setData({ ...data, businessName: e.target.value })} placeholder="Ej: Mi Cafetería" />
      </div>
      <div className="space-y-2">
        <Label>Tipo de negocio</Label>
        <div className="grid grid-cols-1 gap-2">
          {businessTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => setData({ ...data, businessType: t.value })}
              className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                data.businessType === t.value ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>,
    // Step 1: Country & goal
    <div key={1} className="space-y-4">
      <h2 className="font-heading text-xl font-bold">¿Dónde opera tu negocio?</h2>
      <div className="space-y-2">
        <Label>País</Label>
        <div className="grid grid-cols-2 gap-2">
          {countries.map((c) => (
            <button
              key={c}
              onClick={() => setData({ ...data, country: c })}
              className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                data.country === c ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Objetivo principal</Label>
        {goals.map((g) => (
          <button
            key={g}
            onClick={() => setData({ ...data, goal: g })}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
              data.goal === g ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"
            }`}
          >
            {g}
          </button>
        ))}
      </div>
    </div>,
    // Step 2: WhatsApp
    <div key={2} className="space-y-4">
      <h2 className="font-heading text-xl font-bold">Último paso</h2>
      <p className="text-muted-foreground text-sm">Agrega tu WhatsApp para recibir notificaciones de tus campañas (opcional).</p>
      <div className="space-y-2">
        <Label>WhatsApp</Label>
        <Input value={data.whatsapp} onChange={(e) => setData({ ...data, whatsapp: e.target.value })} placeholder="+506 8888-8888" />
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3">
          <img src={ticoflowLogo} alt="TicoFlow" className="h-12 w-12 rounded-full" />
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 w-10 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
        </div>

        {steps[step]}

        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">Atrás</Button>
          )}
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} className="flex-1" disabled={step === 0 && (!data.businessName || !data.businessType)}>
              Siguiente
            </Button>
          ) : (
            <Button onClick={handleFinish} className="flex-1" disabled={loading}>
              {loading ? "Guardando..." : "Comenzar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
