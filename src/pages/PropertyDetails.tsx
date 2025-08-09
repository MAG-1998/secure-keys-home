import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { MapPin, Bed, Bath, Square, Calendar, MessageCircle, Heart, Maximize2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MagitLogo } from "@/components/MagitLogo";
import { useTranslation } from "@/hooks/useTranslation";

interface PropertyDetail {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  location: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  image_url: string | null;
  photos: string[] | null;
  visit_hours: any;
  is_verified?: boolean | null;
  is_halal_financed?: boolean | null;
  halal_financing_status?: string | null;
  profiles?: { full_name?: string | null; email?: string | null; user_id?: string } | null;
}

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const { language, setLanguage } = useTranslation();

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [message, setMessage] = useState("");

  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [customDateTime, setCustomDateTime] = useState<string>("");

  const images = useMemo(() => {
    const arr: string[] = [];
    if (property?.image_url) arr.push(property.image_url);
    if (Array.isArray(property?.photos)) arr.push(...(property?.photos as string[]));
    // Ensure unique and valid
    return Array.from(new Set(arr.filter(Boolean)));
  }, [property]);

  // Attempt to normalize visit hours into ISO strings
  const availableSlots: string[] = useMemo(() => {
    const v = property?.visit_hours;
    if (!v) return [];
    try {
      if (Array.isArray(v)) {
        // items could be strings or objects {date, time}
        const normalized = v.map((item: any) => {
          if (typeof item === "string") return item;
          if (item?.iso) return item.iso;
          if (item?.date && item?.time) return `${item.date}T${item.time}`;
          if (item?.datetime) return item.datetime;
          return null;
        }).filter(Boolean);
        return normalized as string[];
      }
    } catch {}
    return [];
  }, [property?.visit_hours]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data: prop, error } = await supabase
          .from("properties")
          .select("*, profiles:user_id (full_name, email, user_id)")
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;
        if (!prop) {
          navigate("/properties");
          return;
        }
        setProperty(prop as unknown as PropertyDetail);
        document.title = `${(prop as any).title || "Property"} – Details`;

        // Check saved state if logged in
        const { data: { user: sUser } } = await supabase.auth.getUser();
        if (sUser) {
          const { data: saved } = await supabase
            .from("saved_properties")
            .select("id")
            .eq("user_id", sUser.id)
            .eq("property_id", id)
            .maybeSingle();
          if (saved) {
            setIsSaved(true);
            setSavedId(saved.id);
          }
        }
      } catch (e: any) {
        console.error(e);
        toast({ title: "Error", description: e.message || "Failed to load property" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate, toast]);

  const toggleSave = async () => {
    try {
      const { data: { user: sUser } } = await supabase.auth.getUser();
      if (!sUser) {
        navigate("/auth");
        return;
      }
      if (isSaved && savedId) {
        const { error } = await supabase
          .from("saved_properties")
          .delete()
          .eq("id", savedId);
        if (error) throw error;
        setIsSaved(false);
        setSavedId(null);
        toast({ title: "Removed", description: "Property removed from saved" });
      } else {
        const { data, error } = await supabase
          .from("saved_properties")
          .insert({ user_id: sUser.id, property_id: id! })
          .select("id")
          .maybeSingle();
        if (error) throw error;
        setIsSaved(true);
        setSavedId(data?.id || null);
        toast({ title: "Saved", description: "Property saved for later" });
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: e.message || "Failed to update saved" });
    }
  };

  const requestVisit = async () => {
    try {
      const { data: { user: sUser } } = await supabase.auth.getUser();
      if (!sUser) {
        navigate("/auth");
        return;
      }
      const pick = selectedSlot || customDateTime;
      if (!pick) {
        toast({ title: "Select time", description: "Choose an available slot or pick a custom time" });
        return;
      }
      const visitDate = new Date(pick).toISOString();
      const { error } = await supabase
        .from("property_visits")
        .insert({
          property_id: id!,
          visitor_id: sUser.id,
          visit_date: visitDate,
          is_custom_time: !!customDateTime && !selectedSlot,
        });
      if (error) throw error;
      toast({ title: "Request sent", description: "The owner will be notified of your request" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: e.message || "Failed to request visit" });
    }
  };

  const sendMessage = async () => {
    try {
      if (!message.trim()) return;
      const { data: { user: sUser } } = await supabase.auth.getUser();
      if (!sUser) {
        navigate("/auth");
        return;
      }
      if (!property?.user_id) return;
      const { error } = await (supabase as any)
        .from("messages")
        .insert({
          sender_id: sUser.id,
          recipient_id: property.user_id,
          property_id: id!,
          content: message.trim(),
        });
      if (error) throw error;
      setMessage("");
      toast({ title: "Message sent", description: "The owner has received your message" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: e.message || "Failed to send message" });
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Error signing out", description: error.message, variant: "destructive" });
    } else {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="text-muted-foreground">Loading property...</div>
        </div>
      </section>
    );
  }

  if (!property) {
    return (
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="text-muted-foreground">Property not found.</div>
          <Button className="mt-4" variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <MagitLogo size="sm" />
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={(val) => setLanguage(val as any)}>
              <SelectTrigger className="w-20">
                <SelectValue placeholder={language.toUpperCase()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">ENG</SelectItem>
                <SelectItem value="ru">RU</SelectItem>
                <SelectItem value="uz">UZ</SelectItem>
              </SelectContent>
            </Select>
            {user && (
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            )}
            {user ? (
              <>
                <Button variant="destructive" onClick={handleSignOut}>
                  Sign out
                </Button>
                <Button variant="outline" onClick={() => navigate('/profile')}>
                  Profile
                </Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Sign in
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="py-10">
        <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3 w-full">
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  {images.length > 0 ? (
                    <>
                      <Carousel className="w-full">
                        <CarouselContent>
                          {images.map((src, idx) => (
                            <CarouselItem key={idx}>
                              <div className="relative">
                                <img
                                  src={src}
                                  alt={property.title}
                                  className="w-full h-[380px] object-cover"
                                  loading="lazy"
                                  onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                                />
                                <button
                                  className="absolute top-3 right-3 bg-background/70 backdrop-blur-sm rounded-md p-2"
                                  onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                                  aria-label="Open fullscreen"
                                >
                                  <Maximize2 className="h-4 w-4" />
                                </button>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                      </Carousel>
                    </>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">No images</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="p-6 space-y-4">
                <h1 className="text-2xl font-heading font-bold">{property.title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center"><MapPin className="h-4 w-4 mr-1" /> {property.location}</span>
                  {property.is_verified && (<Badge variant="success">Verified</Badge>)}
                  {property.is_halal_financed && (<Badge variant="trust">Halal Financing</Badge>)}
                </div>
                <div className="flex items-center gap-6 text-muted-foreground">
                  {property.bedrooms != null && (<span className="inline-flex items-center"><Bed className="h-4 w-4 mr-1" /> {property.bedrooms} bed</span>)}
                  {property.bathrooms != null && (<span className="inline-flex items-center"><Bath className="h-4 w-4 mr-1" /> {property.bathrooms} bath</span>)}
                  {property.area != null && (<span className="inline-flex items-center"><Square className="h-4 w-4 mr-1" /> {property.area} m²</span>)}
                </div>
                <div className="text-3xl font-bold text-primary">${Number(property.price).toLocaleString()}</div>
                {property.description && (
                  <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{property.description}</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:w-1/3 w-full space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Actions</h3>
                  <Button variant={isSaved ? "success" : "outline"} onClick={toggleSave}>
                    <Heart className="h-4 w-4 mr-2" /> {isSaved ? "Saved" : "Save"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium inline-flex items-center"><Calendar className="h-4 w-4 mr-2" /> Request a visit</label>
                  {availableSlots.length > 0 && (
                    <select
                      className="w-full rounded-md border bg-background p-2"
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                    >
                      <option value="">Select available slot</option>
                      {availableSlots.map((iso, idx) => (
                        <option value={iso} key={idx}>{new Date(iso).toLocaleString()}</option>
                      ))}
                    </select>
                  )}
                  <div className="text-xs text-muted-foreground">Or pick a custom time:</div>
                  <Input type="datetime-local" value={customDateTime} onChange={(e) => setCustomDateTime(e.target.value)} />
                  <Button className="w-full" onClick={requestVisit}>Send Request</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-3">
                <h3 className="font-semibold inline-flex items-center"><MessageCircle className="h-4 w-4 mr-2" /> Message owner</h3>
                <div className="text-sm text-muted-foreground">{property.profiles?.full_name || property.profiles?.email}</div>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a message..." rows={4} />
                <Button className="w-full" onClick={sendMessage}>Send Message</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-0">
          <div className="relative">
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((src, idx) => (
                  <CarouselItem key={idx} className="flex items-center justify-center bg-black">
                    <img src={src} alt={`${property.title} ${idx + 1}`} className="max-h-[80vh] w-auto object-contain" />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </DialogContent>
      </Dialog>
    </main>
    </>
  );
};

export default PropertyDetails;
