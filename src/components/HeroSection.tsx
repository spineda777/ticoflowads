import { motion } from "framer-motion";
import { CheckCircle, BarChart3, MousePointerClick, Eye } from "lucide-react";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

const HeroSection = () => (
  <section className="min-h-screen flex items-center pt-16 bg-background">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full py-12 md:py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left content */}
        <div>
          <motion.div {...fadeUp(0)}>
            <span className="inline-flex items-center gap-2 bg-accent/10 text-accent-foreground rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              ⚡ Configuración en 3 minutos — Sin experiencia necesaria
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.1)}
            className="font-heading font-bold text-4xl sm:text-5xl lg:text-[56px] leading-tight text-foreground mb-6"
          >
            Tu negocio merece más clientes.{" "}
            <span className="text-primary">La IA crea el anuncio.</span> Tú recibes los resultados.
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-lg text-muted-foreground mb-8 max-w-lg">
            TicoFlowAds.ia genera, publica y gestiona tus anuncios de Facebook e Instagram
            automáticamente. Sin agencias caras. Sin curva de aprendizaje. Sin complicaciones.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-wrap gap-4 mb-4">
            <a
              href="/signup"
              className="rounded-full bg-primary text-primary-foreground px-7 py-3 font-medium hover:bg-secondary transition-colors animate-pulse"
            >
              Crear mi primer anuncio gratis →
            </a>
            <a
              href="#como-funciona"
              className="rounded-full border-2 border-primary text-primary px-7 py-3 font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Ver cómo funciona
            </a>
          </motion.div>

          <motion.p {...fadeUp(0.4)} className="text-xs text-muted-foreground">
            Sin tarjeta de crédito · Primer anuncio en minutos · Cancela cuando quieras
          </motion.p>
        </div>

        {/* Right — Dashboard Mockup */}
        <motion.div {...fadeUp(0.5)}>
          <div className="bg-card rounded-xl shadow-lg border border-border p-6 max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground text-xs font-bold">M</div>
              <div>
                <p className="font-heading font-semibold text-sm text-foreground">Restaurante Doña Carmen</p>
                <p className="text-xs text-muted-foreground">Meta Ads · Campaña activa</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-5 bg-accent/10 rounded-full px-3 py-1.5 w-fit">
              <CheckCircle size={14} className="text-accent-foreground" />
              <span className="text-xs font-medium text-accent-foreground">Publicado en Facebook e Instagram</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { icon: Eye, label: "Alcance", value: "4,820" },
                { icon: MousePointerClick, label: "Clics", value: "312" },
                { icon: BarChart3, label: "CPC", value: "$0.18" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center">
                  <Icon size={16} className="mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-heading font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-accent h-2 rounded-full" style={{ width: "72%" }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Campaña activa · 72% del presupuesto utilizado</p>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;
