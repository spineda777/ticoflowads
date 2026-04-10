import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const TOBY_CONTEXT = `Eres Toby, el asistente IA de TicoFlowAds. TicoFlowAds es una plataforma que crea campañas de Google Ads automáticamente usando inteligencia artificial.

Información sobre TicoFlowAds:
- Plans: Gratis ($0/mes), Starter ($29/mes), Pro ($79/mes), Agencia ($199/mes)
- Starter: 20 campañas/mes, métricas, 5 variantes, soporte prioritario, 3 negocios
- Pro: Campañas ilimitadas, métricas avanzadas + ROI, auto-publicación a Google Ads, IA premium, A/B testing, soporte VIP
- Agencia: Todo de Pro + clientes ilimitados, API, gerente dedicado, white-label, dashboard multi-cliente

Características principales:
- Generación automática de anuncios con IA
- Targeting inteligente
- Métricas de rendimiento
- Integración con Google Ads

Responde de forma amigable, concisa y útil. Si no sabes algo, ofrece contactar al soporte.`;

export default function TobyAI({ variant = "landing" }: { variant?: "landing" | "dashboard" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "¡Hola! 👋 Soy Toby, tu asistente de TicoFlowAds. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setIsTyping(true);

    try {
      const conversationHistory = messages
        .slice(-10)
        .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));

      const { data, error } = await supabase.functions.invoke("toby-chat", {
        body: {
          message: input.trim(),
          context: TOBY_CONTEXT,
          history: conversationHistory,
          userEmail: user?.email,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Lo siento, no pude procesar tu mensaje. ¿Puedes intentar de nuevo?",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Toby error:", err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "¡Ups! Algo salió mal. Por favor intenta de nuevo o contacta a soporte si el problema persiste.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const buttonClass = variant === "landing"
    ? "fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-14 h-14 shadow-lg shadow-primary/25"
    : "fixed bottom-24 right-6 z-50 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-12 h-12 shadow-lg";

  const chatClass = variant === "landing"
    ? "fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]"
    : "fixed bottom-32 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]";

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`${chatClass} bg-background border border-border rounded-2xl shadow-2xl overflow-hidden`}
          >
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">Toby AI</h3>
                  <p className="text-xs opacity-80">Asistente virtual</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-muted/30">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === "user" ? "bg-primary" : "bg-accent"
                    }`}>
                      {msg.role === "user"
                        ? <User className="w-4 h-4 text-primary-foreground" />
                        : <Bot className="w-4 h-4 text-accent-foreground" />
                      }
                    </div>
                    <div className={`rounded-2xl px-4 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-background border border-border rounded-tl-sm"
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex gap-2 justify-start">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div className="bg-background border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-border bg-background">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  disabled={loading}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={loading || !input.trim()} size="icon">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={buttonClass}
          aria-label="Abrir Toby AI"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </Button>
      </motion.div>
    </>
  );
}
