import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => (
  <>
    <Navbar />
    <main className="pt-24 pb-20 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-8">
          Política de Privacidad – TicoFlow
        </h1>

        <p className="text-muted-foreground mb-8">
          En TicoFlow, respetamos y protegemos la privacidad de nuestros usuarios y clientes. Esta política describe cómo recopilamos, usamos y protegemos la información.
        </p>

        <section className="mb-8">
          <h2 className="font-heading font-semibold text-xl text-foreground mb-4">Información que recopilamos</h2>
          <p className="text-muted-foreground mb-3">Podemos recopilar información como:</p>
          <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
            <li>Nombre del negocio</li>
            <li>Nombre del usuario</li>
            <li>Correo electrónico</li>
            <li>Número de teléfono</li>
            <li>Información de clientes y servicios</li>
            <li>Datos relacionados con el uso de la plataforma</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-heading font-semibold text-xl text-foreground mb-4">Uso de la información</h2>
          <p className="text-muted-foreground mb-3">Utilizamos la información para:</p>
          <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
            <li>Proporcionar y mejorar nuestros servicios</li>
            <li>Gestionar clientes, servicios e inventario</li>
            <li>Enviar notificaciones y comunicaciones</li>
            <li>Automatizar procesos comerciales y marketing</li>
            <li>Cumplir con obligaciones legales</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-heading font-semibold text-xl text-foreground mb-4">Compartición de información</h2>
          <p className="text-muted-foreground mb-3">
            No vendemos información personal. Podemos compartir datos únicamente con proveedores tecnológicos necesarios para operar el servicio, como:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
            <li>Servicios de mensajería</li>
            <li>Plataformas de marketing</li>
            <li>Servicios de almacenamiento en la nube</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-heading font-semibold text-xl text-foreground mb-4">Seguridad</h2>
          <p className="text-muted-foreground">
            Implementamos medidas razonables para proteger la información contra acceso no autorizado, pérdida o uso indebido.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-heading font-semibold text-xl text-foreground mb-4">Contacto</h2>
          <p className="text-muted-foreground">
            Si tienes preguntas sobre esta política de privacidad, puedes contactarnos en:{" "}
            <a href="mailto:support@ticoflow.app" className="text-primary underline hover:text-secondary transition-colors">
              support@ticoflow.app
            </a>
          </p>
        </section>

        <p className="text-sm text-muted-foreground border-t border-border pt-6">
          <strong>Última actualización:</strong> 2026
        </p>
      </div>
    </main>
    <Footer />
  </>
);

export default PrivacyPolicy;
