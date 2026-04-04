import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Shield } from "lucide-react";

const TeamPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("staff");
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: p } = await supabase.from("profiles").select("tenant_id").eq("user_id", user.id).single();
      if (p?.tenant_id) {
        setTenantId(p.tenant_id);
        const { data } = await supabase.from("staff_members").select("*").eq("tenant_id", p.tenant_id);
        setMembers(data || []);
      }
    };
    load();
  }, [user]);

  const roleLabels: Record<string, string> = {
    owner: "Propietario",
    admin: "Administrador",
    manager: "Gerente",
    staff: "Empleado",
    viewer: "Visualizador",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-heading text-2xl font-bold">Equipo</h1>

      <Card>
        <CardHeader><CardTitle>Miembros del equipo</CardTitle></CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-muted-foreground text-sm">No hay miembros aún.</p>
          ) : (
            <div className="space-y-3">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{m.user_id === user?.id ? "Tú" : m.user_id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{roleLabels[m.role] || m.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-4 w-4" />Invitar miembro</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">La funcionalidad de invitaciones estará disponible próximamente.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamPage;
