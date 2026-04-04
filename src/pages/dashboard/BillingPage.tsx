import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle } from "lucide-react";

const plans = [
  { id: "free", name: "Gratis", price: "$0/mes", features: ["3 anuncios máximo", "Prueba de 7 días", "Soporte por email"] },
  { id: "starter", name: "Starter", price: "$29/mes", features: ["20 anuncios", "Métricas básicas", "Soporte prioritario"] },
  { id: "pro", name: "Pro", price: "$79/mes", features: ["Anuncios ilimitados", "Métricas avanzadas", "Auto-publicación", "Soporte VIP"] },
  { id: "agency", name: "Agencia", price: "$199/mes", features: ["Multi-cliente", "Todo de Pro", "API acceso", "Gerente dedicado"] },
];

const BillingPage = () => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState("free");
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: p } = await supabase.from("profiles").select("tenant_id").eq("user_id", user.id).single();
      if (p?.tenant_id) {
        const { data: t } = await supabase.from("tenants").select("plan").eq("id", p.tenant_id).single();
        setCurrentPlan(t?.plan || "free");
        const { data: s } = await supabase.from("subscriptions").select("*").eq("tenant_id", p.tenant_id).limit(1).single();
        setSubscription(s);
      }
    };
    load();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="font-heading text-2xl font-bold">Facturación</h1>

      <Card>
        <CardHeader><CardTitle>Plan actual</CardTitle></CardHeader>
        <CardContent>
          <p className="text-lg font-bold text-primary capitalize">{currentPlan}</p>
          {subscription?.current_period_end && (
            <p className="text-sm text-muted-foreground">Renueva: {new Date(subscription.current_period_end).toLocaleDateString("es")}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.id === currentPlan ? "border-primary ring-1 ring-primary" : ""}>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-heading font-bold text-lg">{plan.name}</h3>
                <p className="text-2xl font-bold">{plan.price}</p>
              </div>
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3.5 w-3.5 text-accent" />{f}
                  </li>
                ))}
              </ul>
              <Button variant={plan.id === currentPlan ? "outline" : "default"} className="w-full" disabled={plan.id === currentPlan}>
                {plan.id === currentPlan ? "Plan actual" : "Actualizar"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BillingPage;
