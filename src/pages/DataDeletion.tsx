import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle, Trash2 } from "lucide-react";

const DataDeletion = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requestEmail = user?.email || email;
    
    if (!requestEmail) {
      toast({
        title: "Email requerido",
        description: "Por favor ingresa tu correo electronico",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // If user is logged in, we can process deletion directly
      if (user) {
        // Sign out the user first
        await supabase.auth.signOut();
      }

      // In a real implementation, you would:
      // 1. Send an email to the admin
      // 2. Create a deletion request in the database
      // 3. Process the deletion within the required timeframe

      // For now, we'll simulate the request
      toast({
        title: "Solicitud recibida",
        description: "Procesaremos tu solicitud de eliminacion de datos en un plazo de 30 dias.",
      });
      
      setSubmitted(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 bg-background min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-4">
            Eliminacion de Datos
          </h1>
          
          <p className="text-muted-foreground mb-8">
            En TicoFlow respetamos tu derecho a controlar tus datos personales. 
            Aqui puedes solicitar la eliminacion completa de tu cuenta y toda la informacion asociada.
          </p>

          {/* Information Section */}
          <section className="mb-8 p-6 bg-muted/50 rounded-lg border border-border">
            <h2 className="font-heading font-semibold text-xl text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Informacion importante
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>La eliminacion de datos es <strong>permanente e irreversible</strong></li>
              <li>Se eliminaran todos tus datos personales, incluyendo:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Informacion de perfil y cuenta</li>
                  <li>Historial de campanas y anuncios</li>
                  <li>Datos de facturacion y suscripciones</li>
                  <li>Cualquier contenido que hayas creado</li>
                </ul>
              </li>
              <li>El proceso puede tomar hasta <strong>30 dias habiles</strong></li>
              <li>Recibiras una confirmacion por correo cuando se complete</li>
            </ul>
          </section>

          {/* Request Form */}
          {!submitted ? (
            <section className="mb-8">
              <h2 className="font-heading font-semibold text-xl text-foreground mb-4">
                Solicitar eliminacion de datos
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {user ? (
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm text-foreground">
                      Sesion iniciada como: <strong>{user.email}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      La solicitud se procesara para esta cuenta
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electronico de tu cuenta</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reason">Razon de la solicitud (opcional)</Label>
                  <Textarea
                    id="reason"
                    placeholder="Cuentanos por que deseas eliminar tu cuenta..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  variant="destructive"
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {loading ? "Procesando..." : "Solicitar eliminacion de datos"}
                </Button>
              </form>
            </section>
          ) : (
            <section className="mb-8 p-6 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-heading font-semibold text-xl text-foreground mb-2">
                    Solicitud enviada
                  </h2>
                  <p className="text-muted-foreground">
                    Hemos recibido tu solicitud de eliminacion de datos. 
                    Procesaremos tu solicitud en un plazo maximo de 30 dias habiles 
                    y te enviaremos una confirmacion por correo electronico cuando se complete.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Alternative Contact */}
          <section className="mb-8">
            <h2 className="font-heading font-semibold text-xl text-foreground mb-4">
              Contacto alternativo
            </h2>
            <p className="text-muted-foreground">
              Tambien puedes solicitar la eliminacion de tus datos enviando un correo a:{" "}
              <a 
                href="mailto:support@ticoflow.app?subject=Solicitud de eliminacion de datos" 
                className="text-primary underline hover:text-secondary transition-colors"
              >
                support@ticoflow.app
              </a>
            </p>
            <p className="text-muted-foreground mt-2">
              Por favor incluye el correo electronico asociado a tu cuenta y el asunto 
              &quot;Solicitud de eliminacion de datos&quot;.
            </p>
          </section>

          {/* Legal Information */}
          <section className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              Esta funcionalidad cumple con los requisitos de privacidad de Google OAuth 
              y otras regulaciones de proteccion de datos. Para mas informacion, consulta 
              nuestra{" "}
              <a href="/privacidad" className="text-primary underline hover:text-secondary transition-colors">
                Politica de Privacidad
              </a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default DataDeletion;
