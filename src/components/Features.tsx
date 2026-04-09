import { Sparkles, Send, Target, DollarSign, BarChart3, Globe, Megaphone, Zap } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  { icon: Target, title: "Campañas Google Ads", desc: "La IA genera campañas completas con keywords, títulos y descripciones optimizadas para Google Search", tag: "Google Ads" },
  { icon: Megaphone, title: "Anuncios Meta & TikTok", desc: "Crea anuncios visuales para Facebook, Instagram y TikTok con copies que generan clics y ventas", tag: "Meta · TikTok" },
  { icon: Sparkles, title: "IA multi-plataforma", desc: "Genera variantes con IA premium y elige la que mejor represente tu negocio", tag: "IA" },
  { icon: Send, title: "Publicación automática", desc: "Se publican solos en todas las plataformas sin que hagas nada", tag: "Auto" },
  { icon: DollarSign, title: "Presupuesto bajo control", desc: "Tú defines cuánto invertir. Sin sorpresas ni cobros extras", tag: "Budget" },
  { icon: BarChart3, title: "Reportes simples", desc: "Ve cuántas personas vieron tu anuncio, hicieron clic y te contactaron", tag: "Analytics" },
];

const Features = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-surface-alt py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-4">
            Todo lo que necesitas para conseguir más clientes
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Una sola plataforma para <strong>Google Ads</strong>, <strong>Meta</strong> y <strong>TikTok</strong>. Reemplaza a una agencia de publicidad completa.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <f.icon size={20} className="text-accent-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">{f.tag}</span>
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
