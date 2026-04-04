import { Facebook, Instagram, MessageCircle, FileSpreadsheet, Cpu, Zap } from "lucide-react";

const logos = [
  { icon: Zap, label: "Meta" },
  { icon: Facebook, label: "Facebook" },
  { icon: Instagram, label: "Instagram" },
  { icon: MessageCircle, label: "WhatsApp" },
  { icon: FileSpreadsheet, label: "Google Sheets" },
  { icon: Cpu, label: "OpenAI" },
];

const SocialProof = () => (
  <section className="bg-surface-alt py-10">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <p className="text-center text-sm text-muted-foreground mb-6">
        Conectado con las herramientas que ya conoces
      </p>
      <div className="overflow-hidden">
        <div className="flex gap-12 items-center justify-center flex-wrap md:flex-nowrap md:animate-none">
          {logos.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 opacity-50 shrink-0">
              <Icon size={20} />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default SocialProof;
