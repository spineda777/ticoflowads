import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Megaphone, DollarSign, Activity } from "lucide-react";

const AdminPanel = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, ads: 0, revenue: 0 });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const { data: p } = await supabase.from("profiles").select("tenant_id").eq("user_id", user.id).single();
      if (p?.tenant_id) {
        const { data: sm } = await supabase.from("staff_members").select("role").eq("tenant_id", p.tenant_id).eq("user_id", user.id).single();
        const { data: t } = await supabase.from("tenants").select("owner_user_id").eq("id", p.tenant_id).single();
        setIsAdmin(sm?.role === "owner" || sm?.role === "admin" || t?.owner_user_id === user.id);
      }
    };
    check();
  }, [user]);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Panel de administración</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats.users}</p>
              <p className="text-xs text-muted-foreground">Usuarios</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-accent" />
            <div>
              <p className="text-2xl font-bold">{stats.ads}</p>
              <p className="text-xs text-muted-foreground">Anuncios</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-secondary" />
            <div>
              <p className="text-2xl font-bold">${stats.revenue}</p>
              <p className="text-xs text-muted-foreground">Ingresos</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Actividad del sistema</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">El panel completo de administración estará disponible próximamente con gestión de usuarios, anuncios y métricas globales.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
