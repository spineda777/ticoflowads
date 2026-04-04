import { ClipboardList, BrainCircuit, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    num: "01",
    icon: ClipboardList,
    title: "Cuéntanos de tu negocio",
    desc: "Llena un formulario simple en 2 minutos. Nombre del negocio, tus servicios, quién es tu cliente ideal y cuánto quieres invertir por día.",
  },
  {
    num: "02",
    icon: BrainCircuit,
    title: "La IA crea tu anuncio",
    desc: "Nuestra inteligencia artificial genera el título, el texto y la segmentación ideal para tu negocio. Todo optimizado para Facebook e Instagram.",
  },
  {
    num: "03",
    icon: Rocket,
    title: "Tu anuncio sale al aire",
    desc: "El sistema publica automáticamente en Facebook e Instagram. Recibes una confirmación con el resumen de tu campaña.",
  },
];

const HowItWorks = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="como-funciona" className="bg-background py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-4">
            De cero a publicado en 3 pasos simples
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            No necesitas saber de publicidad, diseño ni tecnología. Solo cuéntanos de tu negocio.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line desktop */}
          <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-0.5 bg-border" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center bg-card rounded-xl border border-border p-8"
            >
              <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4">
                <step.icon size={22} className="text-accent-foreground" />
              </div>
              <span className="font-heading font-bold text-5xl text-border absolute top-4 right-6">
                {step.num}
              </span>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
