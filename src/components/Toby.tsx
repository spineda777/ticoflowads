import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, Sparkles, RotateCcw } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const WELCOME = "¡Hola! Soy **Toby** 👋, tu asistente de TicoFlowAds. Puedo ayudarte a:\n\n• Crear y optimizar campañas de Google Ads\n• Responder preguntas sobre la plataforma\n• Guiarte paso a paso en lo que necesites\n\n¿En qué te ayudo hoy?";

const TobyAvatar = () => (
  <div className="relative flex items-center justify-center w-full h-full">
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
      <circle cx="20" cy="16" r="10" fill="white" fillOpacity="0.9"/>
      <circle cx="16" cy="14" r="2.5" fill="#0d9488"/>
      <circle cx="24" cy="14" r="2.5" fill="#0d9488"/>
      <circle cx="16.8" cy="13.2" r="1" fill="white"/>
      <circle cx="24.8" cy="13.2" r="1" fill="white"/>
      <path d="M15 19 Q20 22 25 19" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 6 Q12 2 16 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" fillOpacity="0.7"/>
      <path d="M30 6 Q28 2 24 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" fillOpacity="0.7"/>
      <path d="M10 16 Q6 16 7 20 Q8 24 12 22" fill="white" fillOpacity="0.7"/>
      <path d="M30 16 Q34 16 33 20 Q32 24 28 22" fill="white" fillOpacity="0.7"/>
    </svg>
  </div>
);

const formatMessage = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/•/g, '•')
    .split('\n')
    .map(line => line.trim() ? `<p class="mb-1 last:mb-0">${line}</p>` : '<br/>')
    .join('');
};

const Toby = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setPulse(false);
    }
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const history = [...messages, { role: "user", content: userMsg }]
        .filter(m => m.content !== WELCOME)
        .map(m => ({ role: m.role, content: m.content }));

      // Try Vercel API first (works in v0 preview), fallback to Supabase Edge Function
      let response: Response;
      let useVercelApi = true;

      try {
        response = await fetch("/api/toby-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });
        
        if (!response.ok && response.status === 404) {
          useVercelApi = false;
        }
      } catch {
        useVercelApi = false;
      }

      // Fallback to Supabase Edge Function
      if (!useVercelApi) {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        response = await fetch(`${supabaseUrl}/functions/v1/toby-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "apikey": supabaseKey,
          },
          body: JSON.stringify({ messages: history }),
        });
      }

      const data = await response!.json();
      if (!response!.ok) throw new Error(data.error || "Error");

      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Ups, tuve un problema conectándome. ¿Puedes intentarlo de nuevo? 🙏"
      }]);
    }
    setLoading(false);
  };

  const reset = () => {
    setMessages([{ role: "assistant", content: WELCOME }]);
    setInput("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-[360px] rounded-2xl overflow-hidden shadow-2xl border border-teal-500/20"
            style={{ background: "linear-gradient(135deg, #0f1a1a 0%, #0a1512 100%)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-teal-500/20"
              style={{ background: "linear-gradient(90deg, #0d4f47 0%, #0a3d37 100%)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #0d9488, #059669)" }}>
                  <TobyAvatar />
                </div>
                <div>
                  <p className="font-bold text-white text-sm leading-tight">Toby</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-teal-300 text-xs">Asistente de TicoFlowAds</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={reset} className="p-1.5 rounded-lg text-teal-300 hover:text-white hover:bg-white/10 transition-all" title="Nueva conversación">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-teal-300 hover:text-white hover:bg-white/10 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-teal-800 scrollbar-track-transparent">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                      style={{ background: "linear-gradient(135deg, #0d9488, #059669)" }}>
                      <TobyAvatar />
                    </div>
                  )}
                  <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-teal-600 text-white rounded-tr-sm"
                      : "bg-white/8 text-gray-100 rounded-tl-sm border border-teal-500/10"
                  }`}>
                    <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #0d9488, #059669)" }}>
                    <TobyAvatar />
                  </div>
                  <div className="bg-white/8 border border-teal-500/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-teal-400"
                        style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-teal-500/20">
              <div className="flex gap-2 items-center bg-white/5 rounded-xl border border-teal-500/20 px-3 py-2 focus-within:border-teal-500/50 transition-all">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Escríbeme algo..."
                  className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-500 outline-none"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
                  style={{ background: input.trim() && !loading ? "linear-gradient(135deg, #0d9488, #059669)" : "transparent" }}
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 text-teal-400 animate-spin" /> : <Send className="w-3.5 h-3.5 text-white" />}
                </button>
              </div>
              <p className="text-center text-gray-600 text-[10px] mt-2">Powered by TicoFlowAds IA</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 rounded-full shadow-lg shadow-teal-900/50 flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0d9488 0%, #059669 100%)" }}
      >
        {pulse && !open && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ background: "linear-gradient(135deg, #0d9488, #059669)" }} />
        )}
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}
              className="w-full h-full flex items-center justify-center">
              <TobyAvatar />
            </motion.div>
          )}
        </AnimatePresence>

        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-emerald-900" />
          </span>
        )}
      </motion.button>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        .bg-white\/8 { background: rgba(255,255,255,0.08); }
      `}</style>
    </div>
  );
};

export default Toby;
