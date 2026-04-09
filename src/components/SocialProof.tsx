import { motion } from "framer-motion";

const logos = [
  { label: "Meta", svg: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/></svg> },
  { label: "Facebook", svg: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3H13v6.95c5.05-.5 9-4.76 9-9.95z"/></svg> },
  { label: "Instagram", svg: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg> },
  { label: "WhatsApp", svg: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M17.47 14.38c-.28-.14-1.65-.81-1.9-.9-.26-.1-.44-.14-.63.14-.19.28-.73.9-.89 1.08-.17.19-.33.21-.61.07-.28-.14-1.16-.43-2.21-1.36-.82-.73-1.37-1.62-1.53-1.9-.16-.28-.02-.43.12-.57.12-.12.28-.33.42-.5.14-.16.19-.28.28-.47.1-.19.05-.35-.02-.5-.07-.14-.63-1.52-.86-2.08-.23-.55-.46-.47-.63-.48h-.54c-.19 0-.5.07-.75.35-.26.28-.99.97-.99 2.36 0 1.4 1.01 2.74 1.15 2.93.14.19 1.99 3.04 4.83 4.26.67.29 1.2.46 1.61.59.68.21 1.29.18 1.78.11.54-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.26-.19-.54-.33zM12.05 21.5a9.49 9.49 0 0 1-4.84-1.32l-.35-.21-3.61.95.96-3.52-.23-.36a9.5 9.5 0 1 1 8.07 4.46zM12.05 2a9.95 9.95 0 0 0-8.47 15.27L2 22l4.84-1.27A9.95 9.95 0 1 0 12.05 2z"/></svg> },
  { label: "Google", svg: <svg viewBox="0 0 24 24" className="h-5 w-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> },
  { label: "Gemini", svg: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 2L9.19 8.63 2 12l7.19 3.37L12 22l2.81-6.63L22 12l-7.19-3.37z"/></svg> },
  { label: "Claude", svg: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg> },
  { label: "ChatGPT", svg: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M22.28 9.37a5.97 5.97 0 0 0-.51-4.92 6.05 6.05 0 0 0-6.52-2.91A6.03 6.03 0 0 0 10.72 0a6.05 6.05 0 0 0-5.77 4.18A5.98 5.98 0 0 0 .96 7.63a6.05 6.05 0 0 0 .74 7.09 5.97 5.97 0 0 0 .51 4.92 6.05 6.05 0 0 0 6.52 2.91A6.03 6.03 0 0 0 13.28 24a6.05 6.05 0 0 0 5.77-4.18 5.98 5.98 0 0 0 3.99-3.45 6.05 6.05 0 0 0-.74-7.09z"/></svg> },
];

// Duplicate for seamless infinite scroll
const allLogos = [...logos, ...logos];

const SocialProof = () => (
  <section className="bg-surface-alt py-10 overflow-hidden">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <p className="text-center text-sm text-muted-foreground mb-6">
        Conectado con las herramientas que ya conoces
      </p>
      <div className="relative">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-surface-alt to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-surface-alt to-transparent z-10" />
        <motion.div
          className="flex gap-12 items-center w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {allLogos.map(({ svg, label }, i) => (
            <div key={`${label}-${i}`} className="flex items-center gap-2 opacity-60 shrink-0">
              {svg}
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

export default SocialProof;
