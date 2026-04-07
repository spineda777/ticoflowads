import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, MousePointerClick, Eye, DollarSign, PlusCircle } from "lucide-react";

const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, published: 0, clicks: 0, impressions: 0, spend: 0 });
  const [recentAds, setRecentAds] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: ads } = await supabase.from("ads").select("*").order("created_at", { ascending: false }).limit(5);
      if (ads) {
        setRecentAds(ads);
        setStats({
          total: ads.length,
          published: ads.filter((a) => a.status === "published").length,
          clicks: ads.reduce((s, a) => s + (a.clicks || 0), 0),
          impressions: ads.reduce((s, a) => s + (a.impressions || 0), 0),
          spend: ads.reduce((s, a) => s + Number(a.spend || 0), 0),
        });
      }
    };
    fetchData();
  }, [user]);

  const statCards = [
    { label: "Total anuncios", value: stats.total, icon: Megaphone, color: "text-primary" },
    { label: "Publicados", value: stats.published, icon: Eye, color: "text-accent" },
    { label: "Clics", value: stats.clicks, icon: MousePointerClick, color: "text-secondary" },
    { label: "Gasto total", value: `$${stats.spend.toFixed(2)}`, icon: DollarSign, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Panel de control</h1>
        <Link to="/dashboard/new-campaign">
          <Button><PlusCircle className="h-4 w-4 mr-2" />Nueva campaña</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <s.icon className={`h-8 w-8 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Anuncios recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAds.length === 0 ? (
            <p className="text-muted-foreground text-sm">No tienes anuncios aún. ¡Crea tu primero!</p>
          ) : (
            <div className="space-y-3">
              {recentAds.map((ad) => (
                <div key={ad.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-sm">{ad.ad_title || "Sin título"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(ad.created_at).toLocaleDateString("es")}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    ad.status === "published" ? "bg-accent/20 text-accent-foreground" :
                    ad.status === "ready" ? "bg-primary/10 text-primary" :
                    ad.status === "error" ? "bg-destructive/10 text-destructive" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {ad.status === "generating" ? "Generando" : ad.status === "ready" ? "Listo" : ad.status === "published" ? "Publicado" : ad.status === "error" ? "Error" : ad.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
