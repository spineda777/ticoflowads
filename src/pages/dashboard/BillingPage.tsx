import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap, Rocket, Crown, Star, TrendingUp, Shield, Headphones, Globe, BarChart3, Users, Code } from "lucide-react";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";

const plans = [
  {
    id: "free",
    name: "Gratis",
    price: "$0",
    period: "/mes",
    description: "Perfecto para probar la plataforma",
    highlight: false,
    icon: Zap,
    features: [
      "3 campañas máximo",
      "Prueba de 7 días",
      "Generación con IA básica",
      "Soporte por email",
      "1 negocio",
    ],
    limitations: ["Sin métricas avanzadas", "Sin auto-publicación"],
  },
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    period: "/mes",
    description: "Para negocios que empiezan a crecer",
    highlight: false,
    icon: Rocket,
    features: [
      "20 campañas/mes",
      "Métricas de rendimiento",
      "5 variantes por campaña",
      "Soporte prioritario",
      "Exportar campañas",
      "3 negocios",
      "Keywords inteligentes",
    ],
    limitations: ["Sin auto-publicación"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$79",
    period: "/mes",
    description: "Para negocios serios que quieren dominar",
    highlight: true,
    badge: "Más popular",
    icon: Crown,
    features: [
      "Campañas ilimitadas",
      "Métricas avanzadas + ROI",
      "Auto-publicación a Google Ads",
      "IA premium (modelos avanzados)",
      "A/B testing automático",
      "Soporte VIP + Chat en vivo",
      "10 negocios",
      "Extensiones de anuncio avanzadas",
      "Optimización automática de keywords",
      "Reportes PDF exportables",
    ],
    limitations: [],
  },
  {
    id: "agency",
    name: "Agencia",
    price: "$199",
    period: "/mes",
    description: "Para agencias que manejan múltiples clientes",
    highlight: false,
    icon: Globe,
    features: [
      "Todo de Pro incluido",
      "Clientes ilimitados",
      "API de integración",
      "Gerente de cuenta dedicado",
      "White-label (tu marca)",
      "Dashboard multi-cliente",
      "Facturación centralizada",
      "Onboarding personalizado",
      "SLA de soporte 99.9%",
    ],
    limitations: [],
  },
];

const BillingPage = () => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState("free");
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: p } = await supabase.from("profiles").select("tenant_id").eq("user_id", user.id).single();
      if (p?.tenant_id) {
        const { data: t } = await supabase.from("tenants").select("plan").eq("id", p.tenant_id).single();
        setCurrentPlan(t?.plan || "free");
        const { data: s } = await supabase.from("subscriptions").select("*").eq("tenant_id", p.tenant_id).limit(1).single();
        setSubscription(s);
      }
    };
    load();
  }, [user]);

  const handleUpgrade = async (planId: string) => {
    if (!user || planId === "free" || planId === currentPlan) return;

    setLoading(planId);
    try {
      const { data: p } = await supabase.from("profiles").select("tenant_id").eq("user_id", user.id).single();

      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { planId, tenantId: p.tenant_id, userEmail: user.email },
      });

      if (error) throw error;
      if (data.sessionId) {
        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId: data.sessionId });
        }
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-3xl font-bold">Elige tu plan</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Escala tu negocio con campañas de Google Ads generadas por IA. Todos los planes incluyen 7 días de prueba gratuita.
        </p>
      </div>

      {/* Current plan indicator */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Tu plan actual: <span className="text-primary font-bold capitalize">{currentPlan}</span></p>
              {subscription?.current_period_end && (
                <p className="text-xs text-muted-foreground">Renueva: {new Date(subscription.current_period_end).toLocaleDateString("es")}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={`relative h-full flex flex-col ${
              plan.highlight
                ? "border-primary ring-2 ring-primary/20 shadow-xl shadow-primary/10"
                : plan.id === currentPlan
                  ? "border-primary/50"
                  : "border-border"
            }`}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3" /> {plan.badge}
                  </span>
                </div>
              )}
              <CardContent className="pt-7 flex flex-col flex-1 space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <plan.icon className={`h-5 w-5 ${plan.highlight ? "text-primary" : "text-muted-foreground"}`} />
                    <h3 className="font-heading font-bold text-lg">{plan.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                  {plan.limitations.map((l) => (
                    <li key={l} className="flex items-start gap-2 text-sm text-muted-foreground/60 line-through">
                      <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 opacity-30" />
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plan.highlight ? "default" : plan.id === currentPlan ? "outline" : "secondary"}
                  className={`w-full ${plan.highlight ? "h-11 text-base" : ""}`}
                  disabled={plan.id === currentPlan || loading !== null}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {loading === plan.id ? "Redirigiendo..." : plan.id === currentPlan ? "Plan actual" : plan.id === "free" ? "Comenzar gratis" : "Actualizar ahora"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Trust signals */}
      <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground pt-4">
        <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Cancela cuando quieras</span>
        <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> Sin contratos largos</span>
        <span className="flex items-center gap-1"><Headphones className="h-3.5 w-3.5" /> Soporte humano real</span>
      </div>
    </div>
  );
};

export default BillingPage;
