import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const testimonials = [
  {
    text: "Nunca pensé que podía pagar publicidad en Facebook. Con TicoFlowAds lancé mi primer anuncio en 5 minutos y conseguí 3 clientes nuevos esa semana.",
    name: "María G.",
    biz: "Salón de Belleza, Guadalajara",
    initials: "MG",
  },
  {
    text: "Antes pagaba $300 al mes a una agencia y no veía resultados. Ahora con $30 al mes tengo anuncios corriendo solos y mi restaurante está lleno los fines de semana.",
    name: "Carlos M.",
    biz: "Restaurante familiar, Miami",
    initials: "CM",
  },
  {
    text: "Soy dentista, no entiendo nada de publicidad. Pero con esto solo llené el formulario y ya tenía pacientes nuevos llamando. Increíble.",
    name: "Dra. Ana V.",
    biz: "Clínica dental, Bogotá",
    initials: "AV",
  },
];

const metrics = [
  { value: 3, suffix: " minutos", label: "para lanzar tu anuncio" },
  { value: 80, suffix: "%", label: "más barato que una agencia" },
  { value: 500, suffix: "+", label: "negocios activos" },
];

const Counter = ({ target, suffix }: { target: number; suffix: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = Math.max(1, Math.floor(target / (duration / 16)));
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [inView, target]);

  return (
    <span ref={ref} className="font-heading font-bold text-4xl sm:text-5xl text-primary-foreground">
      {count}{suffix}
    </span>
  );
};

const Testimonials = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="resultados" className="bg-primary py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-primary-foreground mb-4">
            Negocios reales. Resultados reales.
          </h2>
          <p className="text-accent">Lo que dicen quienes ya confían en TicoFlowAds.ia</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-secondary rounded-xl border border-accent/20 p-6"
            >
              <p className="text-primary-foreground/90 italic text-sm mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs font-bold">
                  {t.initials}
                </div>
                <div>
                  <p className="text-primary-foreground text-sm font-semibold">{t.name}</p>
                  <p className="text-accent text-xs">{t.biz}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {metrics.map((m) => (
            <div key={m.label}>
              <Counter target={m.value} suffix={m.suffix} />
              <p className="text-accent text-sm mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
