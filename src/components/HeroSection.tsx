import { motion } from "framer-motion";
import { CheckCircle, BarChart3, MousePointerClick, Eye, Sparkles, Target, TrendingUp, Zap } from "lucide-react";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

const platformLogos = [
  { name: "Meta", svg: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/></svg> },
  { name: "Google", svg: <svg viewBox="0 0 24 24" className="h-4 w-4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> },
  { name: "TikTok", svg: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.29 0 .58.04.86.11V9.01a6.23 6.23 0 0 0-.86-.06 6.34 6.34 0 1 0 6.34 6.34V9.67a8.16 8.16 0 0 0 3.76.92V7.15a4.85 4.85 0 0 1-1-.46z"/></svg> },
];

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
            TicoFlowAds.ia genera campañas de <strong>Google Ads</strong> y anuncios para <strong>Meta</strong> y <strong>TikTok</strong> automáticamente. Sin agencias caras. Sin curva de aprendizaje. Sin complicaciones.
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

          <motion.div {...fadeUp(0.35)}>
            <GoogleSignInButton />
          </motion.div>

          {/* Platform badges */}
          <motion.div {...fadeUp(0.4)} className="flex items-center gap-3 mt-4">
            <span className="text-xs text-muted-foreground/50">Lanza en varias plataformas</span>
            <div className="flex items-center gap-2">
              {platformLogos.map((p) => (
                <div key={p.name} className="flex items-center gap-1 opacity-40">
                  {p.svg}
                  <span className="text-[10px] font-medium text-muted-foreground/50">{p.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.p {...fadeUp(0.45)} className="text-xs text-muted-foreground mt-2">
            Sin tarjeta de crédito · Primer anuncio en minutos · Cancela cuando quieras
          </motion.p>
        </div>

        {/* Right — Animated Dashboard Cards */}
        <div className="space-y-4">
          {/* Card 1: Meta Ad Performance */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
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

          {/* Card 2: Google Ads Campaign */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="bg-card rounded-xl shadow-md border border-border p-5 max-w-sm mx-auto lg:mx-0 lg:ml-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                  <Target size={14} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-sm text-foreground">Clínica Dental Sonrisa</p>
                  <p className="text-xs text-muted-foreground">Google Ads · 5 variantes</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Conversiones</span>
                  <span className="font-bold text-foreground">47</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Costo/Conversión</span>
                  <span className="font-bold text-primary">$3.21</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Presupuesto</span>
                  <span className="font-bold">$500/mes</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: AI Generation */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <div className="bg-card rounded-xl shadow-md border border-primary/20 p-4 max-w-xs mx-auto lg:mx-0 lg:ml-auto">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-primary" />
                <p className="text-xs font-medium text-primary">IA generando anuncio...</p>
              </div>
              <motion.div
                className="h-1.5 bg-muted rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="h-full bg-primary rounded-full"
                  animate={{ width: ["0%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
              <p className="text-[10px] text-muted-foreground mt-2">Optimizando keywords para tu nicho...</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
