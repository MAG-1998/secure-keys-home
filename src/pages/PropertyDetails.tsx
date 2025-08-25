import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { MapPin, Bed, Bath, Square, Calendar as CalendarIcon, MessageCircle, Heart, Maximize2, LogOut, Edit, Trash2, Flag } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as DatePickerCalendar } from "@/components/ui/calendar";
import { MagitLogo } from "@/components/MagitLogo";
import { useTranslation } from "@/hooks/useTranslation";
import { forceLocalSignOut } from "@/lib/auth";
import { parseISO, isValid, format } from "date-fns";
import { HalalFinancingBreakdown } from "@/components/HalalFinancingBreakdown";
import { useHalalFinancingStore } from "@/hooks/useHalalFinancingStore";

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
  const [searchParams] = useSearchParams();
  const financingStore = useHalalFinancingStore();

  // Initialize halal mode and financing from URL params
  useEffect(() => {
    const halalParam = searchParams.get('halal');
    if (halalParam === '1') {
      financingStore.setFromQueryParams(searchParams);
    }
  }, [searchParams, financingStore]);

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [message, setMessage] = useState("");

  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [customDateTime, setCustomDateTime] = useState<string>("");

  const [dateOnly, setDateOnly] = useState<Date | undefined>();
  const [timeOnly, setTimeOnly] = useState<string>("");
  const [showCustomTime, setShowCustomTime] = useState(false);
  
  const [visitRequestSent, setVisitRequestSent] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  // Handle query parameters for halal financing
  useEffect(() => {
    if (searchParams.toString()) {
      financingStore.setFromQueryParams(searchParams);
    }
  }, [searchParams, financingStore]);

  const handleRequestFinancing = async () => {
    try {
      const { data: { user: sUser } } = await supabase.auth.getUser();
      if (!sUser) {
        navigate("/auth");
        return;
      }
      
      // Validate halal financing if in halal mode
      if (financingStore.isHalalMode && property) {
        const cashAvailable = parseFloat(financingStore.cashAvailable || '0');
        const requiredCash = 0.5 * property.price;
        
        if (cashAvailable < requiredCash) {
          toast({
            title: "Недостаточно средств",
            description: "Для халяль-финансирования нужно внести не менее 50% от стоимости.",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Create a halal financing request
      const { error } = await supabase
        .from("halal_financing_requests")
        .insert({
          property_id: id!,
          user_id: sUser.id,
          status: 'pending',
          request_notes: `Financing request for property: ${property?.title}`
        });
      
      if (error) throw error;
      
      toast({ 
        title: "Financing request submitted", 
        description: "Your halal financing request has been submitted for review" 
      });
    } catch (e: any) {
      console.error(e);
      toast({ 
        title: "Error", 
        description: e.message || "Failed to submit financing request" 
      });
    }
  };

  useEffect(() => {
    if (dateOnly && timeOnly) {
      const dateStr = format(dateOnly, "yyyy-MM-dd");
      setCustomDateTime(`${dateStr}T${timeOnly}`);
    }
  }, [dateOnly, timeOnly]);

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
          if (typeof item === "string") return item.replace(" ", "T");
          const s = item?.iso || (item?.date && item?.time ? `${item.date}T${item.time}` : item?.datetime);
          return typeof s === "string" ? s.replace(" ", "T") : null;
        }).filter(Boolean);
        return normalized as string[];
      }
    } catch {}
    return [];
  }, [property?.visit_hours]);

  const formatSlotLabel = (value: string) => {
    const norm = value?.replace(" ", "T") ?? "";
    try {
      const d = parseISO(norm);
      if (isValid(d)) return format(d, "PPpp");
    } catch {}
    const nd = new Date(norm);
    return isNaN(nd.getTime()) ? norm : nd.toLocaleString();
  };

  const availableTimesForDate = useMemo(() => {
    if (!availableSlots?.length) return [] as string[];
    const selectedDateStr = dateOnly ? format(dateOnly, "yyyy-MM-dd") : null;
    const times = availableSlots
      .map((raw) => {
        const s = (raw || "").toString().trim().replace(" ", "T");
        // If owner provided simple time-of-day (e.g., "09:00"), use it directly
        if (/^\d{2}:\d{2}$/.test(s)) return s;
        try {
          const d = parseISO(s);
          if (!isValid(d)) return null;
          if (selectedDateStr) {
            const dateStr = format(d, "yyyy-MM-dd");
            if (dateStr !== selectedDateStr) return null;
          }
          return format(d, "HH:mm");
        } catch {
          return null;
        }
      })
      .filter(Boolean) as string[];
    return Array.from(new Set(times));
  }, [availableSlots, dateOnly]);

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

          // Check for existing pending visit requests
          const { data: existingRequest } = await supabase
            .from("property_visits")
            .select("id, status")
            .eq("visitor_id", sUser.id)
            .eq("property_id", id)
            .in("status", ["pending", "confirmed"])
            .maybeSingle();
          if (existingRequest) {
            setHasPendingRequest(true);
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
      const pickRaw = selectedSlot || customDateTime;
      if (!pickRaw) {
        toast({ title: "Select time", description: "Choose an available slot or pick a custom time" });
        return;
      }
      const pick = pickRaw.replace(" ", "T");
      let visitDate: string;
      try {
        const d = parseISO(pick);
        visitDate = isValid(d) ? d.toISOString() : (() => { const nd = new Date(pick); if (isNaN(nd.getTime())) throw new Error("Invalid date/time selected"); return nd.toISOString(); })();
      } catch {
        toast({ title: "Invalid date", description: "Please choose a valid date and time." });
        return;
      }
      const { error } = await supabase
        .from("property_visits")
        .insert({
          property_id: id!,
          visitor_id: sUser.id,
          visit_date: visitDate,
          is_custom_time: !!customDateTime && !selectedSlot,
        });
      if (error) throw error;
      setVisitRequestSent(true);
      setHasPendingRequest(true);
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
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        await forceLocalSignOut();
        navigate("/");
        toast({ title: "Signed out", description: "You have been logged out." });
        setTimeout(() => window.location.reload(), 0);
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        const msg = (error as any).message?.toLowerCase?.() || '';
        if (msg.includes('session') && msg.includes('missing')) {
          await forceLocalSignOut();
        } else {
          throw error;
        }
      }
      await forceLocalSignOut();
      navigate("/");
      toast({ title: "Signed out", description: "You have been logged out." });
      setTimeout(() => window.location.reload(), 0);
    } catch (e: any) {
      await forceLocalSignOut();
      navigate("/");
      toast({ title: "Signed out", description: "You have been logged out." });
      setTimeout(() => window.location.reload(), 0);
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
                <Button variant="outline" onClick={() => navigate('/profile')}>
                  Profile
                </Button>
                <Button variant="destructive" size="icon" onClick={handleSignOut} aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
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
                  <div className="flex items-start justify-between gap-2">
                    <h1 className="text-2xl font-heading font-bold">{property.title}</h1>
                    {user?.id !== property.user_id && (
                      <Button variant={isSaved ? "success" : "outline"} size="sm" onClick={toggleSave} aria-label={isSaved ? "Saved" : "Save"}>
                        <Heart className="h-4 w-4 mr-2" /> {isSaved ? "Saved" : "Save"}
                      </Button>
                    )}
                  </div>
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
              {/* Check if user is the property owner */}
              {user?.id === property.user_id ? (
                // Owner view - show edit/delete options
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold">Manage Property</h3>
                    <div className="space-y-3">
                      <Button 
                        className="w-full" 
                        onClick={() => navigate(`/manage-property/${property.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Property
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
                            // Handle delete
                            supabase.from('properties').delete().eq('id', property.id).then(() => {
                              toast({ title: "Property deleted", description: "Your property has been removed" });
                              navigate('/my-properties');
                            });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Property
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // Visitor view - show visit/message/report options
                <>
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Actions</h3>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium inline-flex items-center"><CalendarIcon className="h-4 w-4 mr-2" /> Request a visit</label>

                    {/* Step 1: Choose date */}
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">1. Choose a date</div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start font-normal">
                            {dateOnly ? format(dateOnly, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <DatePickerCalendar
                            mode="single"
                            selected={dateOnly}
                            onSelect={(d) => {
                              setDateOnly(d);
                              setSelectedSlot("");
                            }}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Step 2: Choose available time */}
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">2. Choose an available time</div>
                      <div className="flex flex-wrap gap-2">
                        {dateOnly && availableTimesForDate.length > 0 ? (
                          availableTimesForDate.map((t, idx) => {
                            const slot = `${format(dateOnly!, "yyyy-MM-dd")}T${t}`;
                            const isSelected = selectedSlot === slot;
                            return (
                              <Button
                                key={idx}
                                variant={isSelected ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => {
                                  setTimeOnly(t);
                                  setSelectedSlot(slot);
                                  setShowCustomTime(false);
                                }}
                              >
                                {t}
                              </Button>
                            );
                          })
                        ) : (
                          <div className="text-xs text-muted-foreground">{dateOnly ? 'No predefined times for this date' : 'Pick a date to see available times'}</div>
                        )}
                      </div>
                    </div>

                    {/* Step 3: Request other time with deposit info */}
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">3. Request other time (requires 200,000 UZS deposit)</div>
                      <div className="flex items-start gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSlot("");
                            setShowCustomTime((v) => !v);
                          }}
                        >
                          {showCustomTime ? 'Cancel other time' : 'Request other time'}
                        </Button>
                        {showCustomTime && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={timeOnly}
                              onChange={(e) => setTimeOnly(e.target.value)}
                              className="w-[140px]"
                              disabled={!dateOnly}
                            />
                            <span className="text-xs text-muted-foreground">{dateOnly ? 'Pick your preferred time' : 'Pick a date first'}</span>
                          </div>
                        )}
                      </div>
                      {showCustomTime && (
                        <div className="text-xs text-muted-foreground">A refundable 200,000 UZS deposit is required for custom times to show seriousness.</div>
                      )}
                    </div>

                        <Button 
                          className="w-full" 
                          onClick={requestVisit}
                          disabled={visitRequestSent || hasPendingRequest}
                        >
                          {visitRequestSent ? 'Request Sent ✓' : 
                           hasPendingRequest ? 'Request Already Pending' :
                           (showCustomTime && timeOnly && dateOnly ? 'Send Request (200k deposit)' : 'Send Request')}
                        </Button>
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

                  {/* Halal Financing Breakdown - only show for halal financed properties */}
                  {property.is_halal_financed && (
                    <HalalFinancingBreakdown 
                      propertyPrice={property.price}
                      onRequestFinancing={handleRequestFinancing}
                      initialCashAvailable={financingStore.cashAvailable}
                      initialPeriodMonths={financingStore.periodMonths}
                    />
                  )}

                  <Card>
                    <CardContent className="p-6">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          // Handle report property
                          toast({ title: "Report submitted", description: "Thank you for reporting this property" });
                        }}
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        Report Property
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}
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
