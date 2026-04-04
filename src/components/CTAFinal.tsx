import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const CTAFinal = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="cta-final" className="bg-primary py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center" ref={ref}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-primary-foreground mb-4"
        >
          ¿Listo para conseguir más clientes sin complicaciones?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="text-accent mb-8"
        >
          Únete a más de 500 negocios que ya tienen sus anuncios corriendo solos.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
        >
          <a
            href="#"
            className="inline-block rounded-full bg-background text-primary px-8 py-4 font-heading font-bold text-lg hover:opacity-90 transition-opacity"
          >
            Crear mi primer anuncio gratis →
          </a>
          <p className="text-primary-foreground/60 text-xs mt-4">
            Sin tarjeta de crédito · Cancela cuando quieras
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTAFinal;
