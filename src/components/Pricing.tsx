import { useState } from "react";
import { Check } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const plans = [
  {
    name: "Gratis",
    monthly: 0,
    annual: 0,
    features: [
      "1 anuncio al mes",
      "Generación de texto con IA",
      "Publicación manual",
      "Soporte por email",
    ],
    cta: "Empezar gratis",
    popular: false,
  },
  {
    name: "Starter",
    monthly: 29,
    annual: 23,
    features: [
      "10 anuncios al mes",
      "Publicación automática",
      "Reportes básicos de rendimiento",
      "Soporte prioritario por WhatsApp",
      "1 cuenta de Meta conectada",
    ],
    cta: "Elegir Starter",
    popular: true,
  },
  {
    name: "Pro",
    monthly: 79,
    annual: 63,
    features: [
      "Anuncios ilimitados",
      "Múltiples cuentas de Meta",
      "Dashboard de reportes avanzado",
      "A/B testing de anuncios",
      "Soporte dedicado + videollamada",
    ],
    cta: "Elegir Pro",
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

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`relative bg-card rounded-xl border p-8 hover:scale-[1.02] transition-transform ${
                plan.popular ? "border-accent border-2" : "border-border"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                  Más popular
                </span>
              )}
              <h3 className="font-heading font-bold text-xl text-foreground mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="font-heading font-bold text-4xl text-foreground">
                  ${annual ? plan.annual : plan.monthly}
                </span>
                <span className="text-muted-foreground text-sm">/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check size={16} className="text-accent mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#cta-final"
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
