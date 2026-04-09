import { useState } from "react";
import { Check, Zap, Rocket, Crown, Globe, Star } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const plans = [
  {
    id: "free",
    name: "Gratis",
    monthly: 0,
    annual: 0,
    icon: Zap,
    description: "Perfecto para probar la plataforma",
    features: [
      "3 campañas máximo",
      "Prueba de 7 días",
      "Generación con IA básica",
      "Soporte por email",
      "1 negocio",
    ],
    limitations: ["Sin métricas avanzadas", "Sin auto-publicación"],
    cta: "Empezar gratis",
    popular: false,
  },
  {
    id: "starter",
    name: "Starter",
    monthly: 29,
    annual: 23,
    icon: Rocket,
    description: "Para negocios que empiezan a crecer",
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
    cta: "Elegir Starter",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 79,
    annual: 63,
    icon: Crown,
    description: "Para negocios serios que quieren dominar",
    badge: "Más popular",
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
    cta: "Elegir Pro",
    popular: true,
  },
  {
    id: "agency",
    name: "Agencia",
    monthly: 199,
    annual: 159,
    icon: Globe,
    description: "Para agencias que manejan múltiples clientes",
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
    cta: "Contactar ventas",
    popular: false,
  },
];

const Pricing = () => {
  const [annual, setAnnual] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="precios" className="bg-background py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-4">
            Un precio claro. Sin letra pequeña.
          </h2>
          <p className="text-muted-foreground mb-6">Empieza gratis. Escala cuando lo necesites.</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-muted rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Anual <span className="text-accent text-xs">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`relative bg-card rounded-xl border p-7 hover:scale-[1.02] transition-transform flex flex-col ${
                plan.popular ? "border-primary border-2 ring-2 ring-primary/20 shadow-xl shadow-primary/10" : "border-border"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3" /> {plan.badge}
                </span>
              )}
              <div className="flex items-center gap-2 mb-2">
                <plan.icon className={`h-5 w-5 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                <h3 className="font-heading font-bold text-xl text-foreground">{plan.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="font-heading font-bold text-4xl text-foreground">
                  ${annual ? plan.annual : plan.monthly}
                </span>
                <span className="text-muted-foreground text-sm">/mes</span>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check size={16} className="text-accent mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
                {plan.limitations?.map((l) => (
                  <li key={l} className="flex items-start gap-2 text-sm text-muted-foreground/60 line-through">
                    <Check size={16} className="shrink-0 mt-0.5 opacity-30" />
                    {l}
                  </li>
                ))}
              </ul>
              <a
                href="/signup"
                className={`block text-center rounded-full py-3 font-medium text-sm transition-colors ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-secondary"
                    : "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          ¿Tienes más de 10 negocios?{" "}
          <a href="#cta-final" className="underline text-primary">
            Contáctanos para un plan agencia.
          </a>
        </p>
      </div>
    </section>
  );
};

export default Pricing;
