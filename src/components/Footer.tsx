import { Facebook, Instagram, Linkedin } from "lucide-react";

const Footer = () => (
  <footer className="bg-dark-green text-primary-foreground py-16">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        {/* Col 1 */}
        <div>
          <p className="font-heading font-bold text-lg mb-2">
            TicoFlowAds<span className="text-accent">.ia</span>
          </p>
          <p className="text-sm text-primary-foreground/60 mb-4">
            Anuncios en Facebook e Instagram, creados y publicados por IA en minutos.
          </p>
          <p className="text-xs text-primary-foreground/40 mb-4">Hecho con ❤ en Latinoamérica</p>
          <div className="flex gap-3">
            <a href="#" className="text-primary-foreground/50 hover:text-accent transition-colors"><Instagram size={18} /></a>
            <a href="#" className="text-primary-foreground/50 hover:text-accent transition-colors"><Facebook size={18} /></a>
            <a href="#" className="text-primary-foreground/50 hover:text-accent transition-colors"><Linkedin size={18} /></a>
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <p className="font-heading font-semibold text-sm mb-4">Producto</p>
          <ul className="space-y-2 text-sm text-primary-foreground/60">
            <li><a href="#como-funciona" className="hover:text-accent transition-colors">Cómo funciona</a></li>
            <li><a href="#precios" className="hover:text-accent transition-colors">Precios</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Demo</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Changelog</a></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <p className="font-heading font-semibold text-sm mb-4">Empresa</p>
          <ul className="space-y-2 text-sm text-primary-foreground/60">
            <li><a href="#" className="hover:text-accent transition-colors">Sobre nosotros</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Contacto</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Afiliados</a></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <p className="font-heading font-semibold text-sm mb-4">Legal</p>
          <ul className="space-y-2 text-sm text-primary-foreground/60">
            <li><a href="#" className="hover:text-accent transition-colors">Política de privacidad</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Términos de uso</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Política de cookies</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/40">
        © 2025 TicoFlowAds.ia — Todos los derechos reservados.
      </div>
    </div>
  </footer>
);

export default Footer;
