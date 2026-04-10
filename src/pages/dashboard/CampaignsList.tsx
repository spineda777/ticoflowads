import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Target, DollarSign, MapPin, ExternalLink } from "lucide-react";

const CampaignsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("campaign_drafts")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setCampaigns(data || []));
  }, [user]);

  const statusLabel: Record<string, string> = {
    draft: "Borrador",
    published_test: "Test Mode",
    published_live: "En vivo",
  };

  const statusColor: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    published_test: "bg-yellow-500/10 text-yellow-600",
    published_live: "bg-accent/20 text-accent-foreground",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Mis campañas</h1>
        <Button onClick={() => navigate("/dashboard/new-campaign")}>
          + Nueva campaña
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-muted-foreground">No hay campañas aún. ¡Crea tu primera!</p>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-heading font-medium">{c.campaign_name || "Campaña sin nombre"}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{c.ad_title}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />${Number(c.budget_monthly).toLocaleString()}/mo
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />{c.primary_goal}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{c.targeting_radius}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[c.status] || "bg-muted text-muted-foreground"}`}>
                      {statusLabel[c.status] || c.status}
                    </span>
                    {c.test_mode && (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600 font-medium">
                        🔒 Test
                      </span>
                    )}
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

export default CampaignsList;
