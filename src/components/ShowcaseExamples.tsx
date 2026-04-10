import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Zap, TrendingUp, Eye, MousePointer, Megaphone, Target, BarChart3, Palette } from "lucide-react";

const examples = [
  {
    category: "Campañas generadas",
    title: "Restaurante Tico",
    icon: Megaphone,
    description: "Campaña para restaurante costarricense",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
    stats: { impressions: "45.2K", clicks: "1,892", ctr: "4.2%" },
    badge: "Google Ads",
  },
  {
    category: "Anuncios con IA",
    title: "Tienda de Ropa Moderna",
    icon: Palette,
    description: "5 variantes de anuncios creadas automáticamente",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop",
    stats: { impressions: "78.9K", clicks: "3,156", ctr: "4.0%" },
    badge: "Facebook Ads",
  },
  {
    category: "Dashboard",
    title: "Rendimiento en tiempo real",
    icon: BarChart3,
    description: "Métricas y ROI de todas tus campañas",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    stats: { impressions: "124K", clicks: "5,890", ctr: "4.7%" },
    badge: "Analytics",
  },
  {
    category: "Targeting IA",
    title: "Segmentación inteligente",
    icon: Target,
    description: "Llega a tu público ideal automáticamente",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop",
    stats: { impressions: "32.1K", clicks: "2,140", ctr: "6.7%" },
    badge: "AI Powered",
  },
  {
    category: "A/B Testing",
    title: "Variantes optimizadas",
    icon: Zap,
    description: "La IA testa y escoge el mejor anuncio",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    stats: { impressions: "89.4K", clicks: "4,210", ctr: "4.7%" },
    badge: "Auto Optimized",
  },
  {
    category: "ROI Tracking",
    title: "Retorno de inversión",
    icon: TrendingUp,
    description: "Ve exactamente cuánto ganas por cada dólar invertido",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop",
    stats: { impressions: "156K", clicks: "7,340", ctr: "4.7%" },
    badge: "Pro Plan",
  },
];

const ShowcaseExamples = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent-foreground text-sm font-medium mb-4">
              Ejemplos reales
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-4">
              Mira lo que TicoFlowAds puede crear
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Campañas profesionales, anuncios optimizados y dashboards con métricas reales. Todo generado por IA en segundos.
            </p>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {examples.map((example, i) => (
            <motion.div
              key={example.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={example.image}
                  alt={example.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-primary/90 text-primary-foreground text-xs font-medium rounded-full">
                    {example.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-accent/90 text-accent-foreground text-xs font-medium rounded-full flex items-center gap-1">
                    <example.icon size={12} />
                    {example.badge}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-heading font-bold text-white text-lg">{example.title}</h3>
                  <p className="text-white/80 text-sm">{example.description}</p>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <Eye size={16} className="mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs font-bold text-foreground">{example.stats.impressions}</p>
                    <p className="text-[10px] text-muted-foreground">Impresiones</p>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <MousePointer size={16} className="mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs font-bold text-foreground">{example.stats.clicks}</p>
                    <p className="text-[10px] text-muted-foreground">Clics</p>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <TrendingUp size={16} className="mx-auto mb-1 text-accent-foreground" />
                    <p className="text-xs font-bold text-accent-foreground">{example.stats.ctr}</p>
                    <p className="text-[10px] text-muted-foreground">CTR</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/5 border border-primary/20 rounded-full">
            <Zap size={18} className="text-primary" />
            <span className="text-sm text-foreground">
              <span className="font-semibold">+500 campañas</span> creadas exitosamente este mes
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ShowcaseExamples;
