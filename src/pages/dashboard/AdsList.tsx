import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Eye, MousePointerClick, DollarSign, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdsList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [ads, setAds] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("ads").select("*").order("created_at", { ascending: false }).then(({ data }) => setAds(data || []));
  }, [user]);

  const statusLabel: Record<string, string> = {
    generating: "Generando...",
    ready: "Listo",
    pending_publish: "Publicando...",
    published: "Publicado",
    error: "Error",
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Mis anuncios</h1>

      {ads.length === 0 ? (
        <p className="text-muted-foreground">No hay anuncios aún.</p>
      ) : (
        <div className="space-y-4">
          {ads.map((ad) => (
            <Card key={ad.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-medium">{ad.ad_title || "Anuncio sin título"}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{ad.ad_body}</p>
                    {ad.call_to_action && (
                      <p className="text-xs text-primary font-medium">CTA: {ad.call_to_action}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{ad.impressions}</span>
                      <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" />{ad.clicks}</span>
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${Number(ad.spend).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      ad.status === "published" ? "bg-accent/20 text-accent-foreground" :
                      ad.status === "ready" ? "bg-primary/10 text-primary" :
                      ad.status === "error" ? "bg-destructive/10 text-destructive" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {statusLabel[ad.status] || ad.status}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/ads/${ad.id}`)}>
                      <ExternalLink className="h-3 w-3 mr-1" />Ver detalle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdsList;
