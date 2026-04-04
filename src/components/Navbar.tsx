import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


const navLinks = [
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Resultados", href: "#resultados" },
  { label: "Precios", href: "#precios" },
  { label: "FAQ", href: "#faq" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background ${
        scrolled ? "shadow-md border-b border-border" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 font-heading font-bold text-xl text-primary">
          <img src="/5da9c6eb-3bed-45d2-89f7-f648023bbeca.png" alt="TicoFlow logo" className="h-8 w-8 rounded-full object-cover" />
          TicoFlowAds<span className="text-accent">.ia</span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <a
          href="#cta-final"
          className="hidden md:inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-secondary transition-colors"
        >
          Empieza gratis →
        </a>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-64 bg-background shadow-xl z-50 flex flex-col p-6 pt-20 md:hidden"
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 right-4 text-foreground"
              aria-label="Cerrar"
            >
              <X size={24} />
            </button>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="py-3 text-foreground font-medium border-b border-border"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#cta-final"
              onClick={() => setMenuOpen(false)}
              className="mt-6 rounded-full bg-primary text-primary-foreground px-5 py-3 text-center text-sm font-medium"
            >
              Empieza gratis →
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
