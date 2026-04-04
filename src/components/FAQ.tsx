import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "¿Necesito experiencia en publicidad o tecnología?",
    a: "No. Solo necesitas conocer tu negocio. El formulario tarda 2 minutos, y la IA hace todo el resto.",
  },
  {
    q: "¿Cuánto tiempo tarda en publicarse mi anuncio?",
    a: "Generalmente entre 5 y 30 minutos desde que envías el formulario. Meta revisa el anuncio antes de mostrarlo, lo cual puede tomar hasta 24 horas.",
  },
  {
    q: "¿Funciona para negocios fuera de Costa Rica?",
    a: "Sí. TicoFlowAds.ia funciona para cualquier negocio en Latinoamérica, Estados Unidos o cualquier país donde Meta permita publicidad.",
  },
  {
    q: "¿Qué necesito para empezar?",
    a: "Una página de Facebook o cuenta de Instagram de tu negocio, una cuenta en Meta Business, y definir tu presupuesto diario (mínimo $3 USD/día).",
  },
  {
    q: "¿Puedo cancelar mi plan en cualquier momento?",
    a: "Sí. Cancelas cuando quieras desde tu panel, sin penalizaciones ni preguntas.",
  },
  {
    q: "¿La IA puede equivocarse o crear un anuncio que no me guste?",
    a: "La IA genera anuncios de alta calidad, pero siempre puedes revisarlo antes de publicarlo en el plan Gratis, o pedirnos ajustes por WhatsApp en los planes de pago.",
  },
  {
    q: "¿Cuánto debo invertir en publicidad?",
    a: "Eso lo decides tú. Recomendamos empezar con $5-$10 USD por día para ver resultados. Ese presupuesto va directo a Meta, no a nosotros.",
  },
];

const FAQ = () => (
  <section id="faq" className="bg-surface-alt py-20 md:py-28">
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-4">
          Preguntas frecuentes
        </h2>
        <p className="text-muted-foreground">Todo lo que necesitas saber antes de empezar.</p>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, i) => (
          <AccordionItem
            key={i}
            value={`faq-${i}`}
            className="bg-card border border-border rounded-xl px-6"
          >
            <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FAQ;
