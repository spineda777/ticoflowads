import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, ImageIcon, Target, Sparkles, CheckCircle, Eye, MousePointerClick, DollarSign, Upload, X, Image as ImageLucide } from "lucide-react";

const AdDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ad, setAd] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [loadingTargeting, setLoadingTargeting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploadingCustom, setUploadingCustom] = useState(false);
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [referencePreviews, setReferencePreviews] = useState<string[]>([]);
  const [imageStyle, setImageStyle] = useState("");
  const [targeting, setTargeting] = useState<any>({
    age_min: 18, age_max: 65, gender: "all",
    interests: [], locations: [], languages: ["Spanish"],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;
    const load = async () => {
      const { data: adData } = await supabase.from("ads").select("*, businesses(*)").eq("id", id).single();
      if (adData) {
        setAd(adData);
        if (adData.targeting && Object.keys(adData.targeting as object).length > 0) {
          setTargeting(adData.targeting);
        }
      }
      const { data: imgData } = await supabase.from("ad_images").select("*").eq("ad_id", id).order("created_at");
      setImages(imgData || []);
      setLoading(false);
    };
    load();
  }, [id, user]);

  const handleReferenceFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + referenceFiles.length > 5) {
      toast({ title: "Máximo 5 imágenes de referencia", variant: "destructive" });
      return;
    }
    const newFiles = [...referenceFiles, ...files].slice(0, 5);
    setReferenceFiles(newFiles);
    // Generate previews
    const previews = newFiles.map(f => URL.createObjectURL(f));
    referencePreviews.forEach(p => URL.revokeObjectURL(p));
    setReferencePreviews(previews);
  };

  const removeReference = (index: number) => {
    URL.revokeObjectURL(referencePreviews[index]);
    setReferenceFiles(prev => prev.filter((_, i) => i !== index));
    setReferencePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadCustomImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !ad) return;
    setUploadingCustom(true);

    for (const file of files) {
      try {
        const ext = file.name.split(".").pop() || "jpg";
        const filePath = `${ad.id}/custom_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("ad-images")
          .upload(filePath, file, { contentType: file.type, upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage.from("ad-images").getPublicUrl(filePath);

        await supabase.from("ad_images").insert({
          ad_id: ad.id,
          image_url: publicUrl.publicUrl,
          prompt: "Imagen subida por el usuario",
          selected: false,
        });
      } catch (err: any) {
        toast({ title: "Error al subir imagen", description: err.message, variant: "destructive" });
      }
    }

    const { data: imgData } = await supabase.from("ad_images").select("*").eq("ad_id", ad.id).order("created_at");
    setImages(imgData || []);
    setUploadingCustom(false);
    toast({ title: "Imágenes subidas correctamente" });
  };

  const generateImages = async () => {
    if (!ad) return;
    setLoadingImages(true);
    try {
      const business = ad.businesses;

      // Upload reference images to storage and get URLs
      const referenceUrls: string[] = [];
      for (const file of referenceFiles) {
        const ext = file.name.split(".").pop() || "jpg";
        const refPath = `${ad.id}/ref_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("ad-images")
          .upload(refPath, file, { contentType: file.type, upsert: true });
        if (!upErr) {
          const { data: pubUrl } = supabase.storage.from("ad-images").getPublicUrl(refPath);
          referenceUrls.push(pubUrl.publicUrl);
        }
      }

      const { data, error } = await supabase.functions.invoke("generate-ad-images", {
        body: {
          ad_id: ad.id,
          business_type: business?.type || "negocio",
          description: business?.description || ad.ad_body || "",
          target_audience: business?.target_audience || "",
          reference_images: referenceUrls,
          style_instructions: imageStyle,
        },
      });
      if (error) throw error;
      toast({ title: `¡${data.count || 0} imágenes generadas!`, description: "Selecciona la que más te guste." });
      const { data: imgData } = await supabase.from("ad_images").select("*").eq("ad_id", ad.id).order("created_at");
      setImages(imgData || []);
    } catch (err: any) {
      toast({ title: "Error al generar imágenes", description: err.message, variant: "destructive" });
    }
    setLoadingImages(false);
  };

  const generateTargeting = async () => {
    if (!ad) return;
    setLoadingTargeting(true);
    try {
      const business = ad.businesses;
      const { data, error } = await supabase.functions.invoke("generate-targeting", {
        body: {
          ad_id: ad.id,
          business_type: business?.type || "negocio",
          description: business?.description || "",
          target_audience: business?.target_audience || "",
          location: business?.location || "Costa Rica",
          objective: ad.ad_title || "",
        },
      });
      if (error) throw error;
      if (data.targeting) setTargeting(data.targeting);
      toast({ title: "Segmentación generada", description: data.targeting?.recommendation || "" });
    } catch (err: any) {
      toast({ title: "Error al generar segmentación", description: err.message, variant: "destructive" });
    }
    setLoadingTargeting(false);
  };

  const selectImage = async (imageId: string) => {
    await supabase.from("ad_images").update({ selected: false }).eq("ad_id", ad.id);
    await supabase.from("ad_images").update({ selected: true }).eq("id", imageId);
    setImages(prev => prev.map(img => ({ ...img, selected: img.id === imageId })));
  };

  const publishAd = async () => {
    if (!ad) return;
    const selectedImage = images.find(img => img.selected);
    if (!selectedImage) {
      toast({ title: "Selecciona una imagen", description: "Debes seleccionar una imagen antes de publicar.", variant: "destructive" });
      return;
    }
    await supabase.from("ads").update({ targeting }).eq("id", ad.id);
    setPublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke("publish-meta-ad", {
        body: { ad_id: ad.id },
      });
      if (error) throw error;
      if (data.error) {
        if (data.code === "META_NOT_CONFIGURED") {
          toast({ title: "Meta Ads no configurado", description: "Agrega tu Access Token y Ad Account ID en Configuración > Negocio.", variant: "destructive" });
        } else {
          throw new Error(data.error);
        }
        setPublishing(false);
        return;
      }
      toast({ title: "¡Anuncio publicado en Meta Ads!", description: "La campaña se creó en modo pausado." });
      setAd((prev: any) => ({ ...prev, status: "published" }));
    } catch (err: any) {
      toast({ title: "Error al publicar", description: err.message, variant: "destructive" });
    }
    setPublishing(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!ad) {
    return <div className="text-center py-12 text-muted-foreground">Anuncio no encontrado.</div>;
  }

  const statusColors: Record<string, string> = {
    generating: "bg-muted text-muted-foreground",
    ready: "bg-primary/10 text-primary",
    publishing: "bg-yellow-500/10 text-yellow-600",
    published: "bg-accent/20 text-accent-foreground",
    error: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">{ad.ad_title || "Anuncio sin título"}</h1>
          <p className="text-muted-foreground text-sm mt-1">{ad.ad_body}</p>
        </div>
        <Badge className={statusColors[ad.status] || "bg-muted"}>
          {ad.status === "published" ? "Publicado" : ad.status === "ready" ? "Listo" : ad.status === "error" ? "Error" : ad.status}
        </Badge>
      </div>

      {/* Ad Preview */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Vista previa del anuncio</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Título:</span> <span className="font-medium">{ad.ad_title}</span></div>
            <div><span className="text-muted-foreground">CTA:</span> <span className="font-medium">{ad.call_to_action}</span></div>
          </div>
          <p className="text-sm bg-muted p-3 rounded-lg">{ad.ad_body}</p>
          {ad.status === "published" && (
            <div className="flex items-center gap-6 pt-2 text-sm">
              <span className="flex items-center gap-1"><Eye className="h-4 w-4 text-muted-foreground" />{ad.impressions} impresiones</span>
              <span className="flex items-center gap-1"><MousePointerClick className="h-4 w-4 text-muted-foreground" />{ad.clicks} clics</span>
              <span className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-muted-foreground" />${Number(ad.spend).toFixed(2)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reference Images & Style */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageLucide className="h-5 w-5 text-accent" />
            Imágenes de referencia y estilo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sube logos, fotos de productos, branding o imágenes de referencia. La IA las usará como inspiración para generar las imágenes del anuncio.
          </p>

          <div className="flex flex-wrap gap-3">
            {referencePreviews.map((preview, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                <img src={preview} alt={`Ref ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeReference(i)}
                  className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {referenceFiles.length < 5 && (
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground mt-1">Agregar</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleReferenceFiles} />
              </label>
            )}
          </div>

          <div className="space-y-2">
            <Label>Instrucciones de estilo (opcional)</Label>
            <Textarea
              value={imageStyle}
              onChange={(e) => setImageStyle(e.target.value)}
              placeholder="Ej: Usa los colores de mi marca (verde y blanco), incluye el logo, estilo minimalista, fondo tropical..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Images Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-accent" />
            Imágenes del anuncio
          </CardTitle>
          <div className="flex gap-2">
            <label>
              <Button variant="outline" size="sm" disabled={uploadingCustom} asChild>
                <span className="cursor-pointer">
                  {uploadingCustom ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Subiendo...</> : <><Upload className="h-4 w-4 mr-2" />Subir propias</>}
                </span>
              </Button>
              <input type="file" accept="image/*" multiple className="hidden" onChange={uploadCustomImages} />
            </label>
            <Button onClick={generateImages} disabled={loadingImages} size="sm" variant="outline">
              {loadingImages ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generando...</> : <><Sparkles className="h-4 w-4 mr-2" />Generar con IA</>}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No hay imágenes aún. Genera con IA o sube las tuyas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  onClick={() => selectImage(img.id)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    img.selected ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-muted-foreground/30"
                  }`}
                >
                  <img src={img.image_url} alt="Ad image" className="w-full aspect-square object-cover" />
                  {img.selected && (
                    <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Targeting Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            Segmentación
          </CardTitle>
          <Button onClick={generateTargeting} disabled={loadingTargeting} size="sm" variant="outline">
            {loadingTargeting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generando...</> : <><Sparkles className="h-4 w-4 mr-2" />Generar con IA</>}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Edad mínima</Label>
              <Input type="number" value={targeting.age_min || 18} onChange={(e) => setTargeting({ ...targeting, age_min: parseInt(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Edad máxima</Label>
              <Input type="number" value={targeting.age_max || 65} onChange={(e) => setTargeting({ ...targeting, age_max: parseInt(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Género</Label>
              <select value={targeting.gender || "all"} onChange={(e) => setTargeting({ ...targeting, gender: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="all">Todos</option>
                <option value="male">Hombres</option>
                <option value="female">Mujeres</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Idiomas</Label>
              <Input value={Array.isArray(targeting.languages) ? targeting.languages.join(", ") : targeting.languages || "Spanish"} onChange={(e) => setTargeting({ ...targeting, languages: e.target.value.split(", ") })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Intereses (separados por coma)</Label>
              <Input value={Array.isArray(targeting.interests) ? targeting.interests.join(", ") : targeting.interests || ""} onChange={(e) => setTargeting({ ...targeting, interests: e.target.value.split(", ").filter(Boolean) })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Ubicaciones (separadas por coma)</Label>
              <Input value={Array.isArray(targeting.locations) ? targeting.locations.join(", ") : targeting.locations || ""} onChange={(e) => setTargeting({ ...targeting, locations: e.target.value.split(", ").filter(Boolean) })} />
            </div>
          </div>
          {targeting.estimated_reach && (
            <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
              <p><strong>Alcance estimado:</strong> {targeting.estimated_reach}</p>
              {targeting.recommendation && <p className="mt-1 text-muted-foreground">{targeting.recommendation}</p>}
              {targeting.daily_budget_suggestion && <p className="mt-1"><strong>Presupuesto sugerido:</strong> ${targeting.daily_budget_suggestion}/día</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publish */}
      {ad.status !== "published" && (
        <Card>
          <CardContent className="pt-6">
            <Button onClick={publishAd} disabled={publishing || images.length === 0} className="w-full" size="lg">
              {publishing ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Publicando en Meta Ads...</> : <><Send className="h-5 w-5 mr-2" />Publicar anuncio en Meta Ads</>}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">La campaña se creará en modo pausado.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdDetail;
