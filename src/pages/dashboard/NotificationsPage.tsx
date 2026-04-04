import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Check } from "lucide-react";

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      setNotifications(data || []);
    });

    // Realtime
    const channel = supabase.channel("notifications").on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
      (payload) => setNotifications((prev) => [payload.new as any, ...prev])
    ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-heading text-2xl font-bold">Notificaciones</h1>
      {notifications.length === 0 ? (
        <p className="text-muted-foreground">No hay notificaciones.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className={!n.is_read ? "border-primary/30 bg-primary/5" : ""}>
              <CardContent className="pt-4 flex items-start gap-3">
                <Bell className={`h-4 w-4 mt-0.5 ${!n.is_read ? "text-primary" : "text-muted-foreground"}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString("es")}</p>
                </div>
                {!n.is_read && (
                  <button onClick={() => markAsRead(n.id)} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Check className="h-3 w-3" />Leído
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
