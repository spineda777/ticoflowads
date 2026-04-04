import { Sparkles, Send, Target, DollarSign, BarChart3, Globe } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  { icon: Sparkles, title: "Anuncios con IA", desc: "La IA redacta copies probados que generan clics y ventas" },
  { icon: Send, title: "Publicación automática", desc: "Se publican solos en Facebook e Instagram sin que hagas nada" },
  { icon: Target, title: "Segmentación inteligente", desc: "Llega a las personas que más necesitan lo que vendes" },
  { icon: DollarSign, title: "Presupuesto bajo control", desc: "Tú defines cuánto invertir. Sin sorpresas ni cobros extras" },
  { icon: BarChart3, title: "Reportes simples", desc: "Ve cuántas personas vieron tu anuncio, hicieron clic y te contactaron" },
  { icon: Globe, title: "En español, para tu mercado", desc: "Diseñado para negocios latinos en Latinoamérica y EE.UU." },
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
            Una sola plataforma reemplaza a una agencia de publicidad completa.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center mb-4">
                <f.icon size={20} className="text-accent-foreground" />
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
