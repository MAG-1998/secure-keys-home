import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { MapPin, Bed, Bath, Square, Calendar as CalendarIcon, MessageCircle, Heart, Maximize2, LogOut, Edit, Trash2, Flag, X, Phone } from "lucide-react";
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
import { useFinancingStore } from "@/stores/financingStore";
import { useGlobalHalalMode } from "@/hooks/useGlobalHalalMode";
import { PropertyEditDialog } from "@/components/PropertyEditDialog";
import { VisitLimitChecker } from "@/components/VisitLimitChecker";
import { formatCurrency, calculateHalalFinancing } from "@/utils/halalFinancing";
import { PriceOdometer } from "@/components/PriceOdometer";
import { getImageUrl } from "@/lib/utils";
import { PropertyLocationMap } from "@/components/PropertyLocationMap";
import { SellerProfileCard } from "@/components/SellerProfileCard";

interface PropertyDetail {
  id: string;
  user_id: string;
  title: string;
  display_name?: string;
  description: string | null;
  location: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  land_area_sotka: number | null;
  image_url: string | null;
  photos: string[] | null;
  visit_hours: any;
  is_verified?: boolean | null;
  is_halal_available?: boolean | null;
  halal_status?: string | null;
  cash_min_percent?: number;
  period_options?: string[];
  property_type?: string;
  latitude?: number | null;
  longitude?: number | null;
  show_phone?: boolean;
  profiles?: { 
    full_name?: string | null; 
    email?: string | null; 
    user_id: string; 
    phone?: string | null;
    account_type?: string | null;
    company_name?: string | null;
    company_logo_url?: string | null;
    company_description?: string | null;
    is_verified?: boolean;
    verification_status?: string | null;
    number_of_properties?: number | null;
    created_at?: string;
  } | null;
}

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const { language, setLanguage, t } = useTranslation();
  const [searchParams] = useSearchParams();
  const financingStore = useFinancingStore();
  const { isHalalMode } = useGlobalHalalMode();

  // Initialize financing parameters from URL params (one-time only)
  useEffect(() => {
    const halalParam = searchParams.get('halal');
    if (halalParam === '1') {
      const urlCash = searchParams.get('cash') || '';
      const urlPeriod = searchParams.get('period') || '';
      
      // Only set URL params, don't force halal mode - let user's global preference handle that
      const updates: any = {};
      if (urlCash && urlCash !== financingStore.cashAvailable) {
        updates.cashAvailable = urlCash;
      }
      if (urlPeriod && urlPeriod !== financingStore.periodMonths) {
        updates.periodMonths = urlPeriod;
      }
      
      if (Object.keys(updates).length > 0) {
        financingStore.updateState(updates);
      }
    }
  }, []); // Empty dependency array for one-time initialization

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);


  const handleRequestFinancing = async (actualCashAvailable?: number, actualPeriodMonths?: number) => {
    try {
      const { data: { user: sUser } } = await supabase.auth.getUser();
      if (!sUser) {
        navigate("/auth");
        return;
      }
      
      if (!property) return;
      
      // Use the actual values passed from the component or fallback to store values
      const cashAvailable = actualCashAvailable ?? parseFloat(financingStore.cashAvailable || '0');
      const periodMonths = actualPeriodMonths ?? parseInt(financingStore.periodMonths || '0');
      const requiredCash = 0.5 * property.price;
      
      // Validate minimum 50% cash requirement
      if (cashAvailable < requiredCash) {
        toast({
          title: "Insufficient Cash Available",
          description: `Halal financing requires at least 50% (${formatCurrency(requiredCash)}) of the property price as cash. You entered ${formatCurrency(cashAvailable)}.`,
          variant: "destructive"
        });
        return;
      }
      
      // Validate period is selected
      if (!periodMonths || periodMonths <= 0) {
        toast({
          title: "Period Required",
          description: "Please select a financing period.",
          variant: "destructive"
        });
        return;
      }
      
      const requestedAmount = property.price - cashAvailable;
      
      // Create a halal financing request
      const { error } = await supabase
        .from("halal_financing_requests")
        .insert({
          property_id: id!,
          user_id: sUser.id,
          status: 'pending',
          stage: 'submitted',
          cash_available: cashAvailable,
          period_months: periodMonths,
          requested_amount: requestedAmount,
          request_notes: `Financing request for property: ${property?.title}`
        });
      
      if (error) throw error;
      
      toast({ 
        title: "Financing request submitted", 
        description: "Your halal financing request has been submitted for review" 
      });
      
      // Navigate to the financing requests page
      navigate('/my-financing');
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
    if (property?.image_url) arr.push(getImageUrl(property.image_url));
    if (Array.isArray(property?.photos)) {
      arr.push(...(property?.photos as string[]).map(photo => getImageUrl(photo)));
    }
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
          .select(`
            *,
            profiles:user_id (
              full_name,
              email,
              user_id,
              phone,
              account_type,
              company_name,
              company_logo_url,
              company_description,
              is_verified,
              verification_status,
              number_of_properties,
              created_at
            )
          `)
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;
        if (!prop) {
          toast({
            title: "Property Not Found",
            description: "The property you're looking for doesn't exist or has been removed.",
            variant: "destructive"
          });
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

        // Property-specific visit request checking is now handled by VisitLimitChecker

        // Get user role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", sUser.id)
          .maybeSingle();
        if (profile) {
          setUserRole(profile.role);
        }
        }
      } catch (e: any) {
        console.error(e);
        const errorMessage = e.message || "Failed to load property";
        
        // Handle specific error types
        if (errorMessage.includes("not found") || errorMessage.includes("404")) {
          toast({ 
            title: "Property Not Found", 
            description: "The property you're looking for doesn't exist or has been removed." 
          });
          navigate("/properties");
        } else {
          toast({ title: "Error", description: errorMessage });
        }
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
        toast({ title: t('property.removed'), description: t('property.removedFromSaved') });
      } else {
        const { data, error } = await supabase
          .from("saved_properties")
          .insert({ user_id: sUser.id, property_id: id! })
          .select("id")
          .maybeSingle();
        if (error) throw error;
        setIsSaved(true);
        setSavedId(data?.id || null);
        toast({ title: t('property.saved'), description: t('property.savedForLater') });
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
    } catch (e: any) {
      await forceLocalSignOut();
      navigate("/");
      toast({ title: "Signed out", description: "You have been logged out." });
    }
  };

  const handlePropertyUpdate = (updatedProperty: PropertyDetail) => {
    setProperty(updatedProperty);
  };

  const handleReportProperty = async () => {
    try {
      const { data: { user: sUser } } = await supabase.auth.getUser();
      if (!sUser) {
        navigate("/auth");
        return;
      }

      if (!reportReason.trim()) {
        toast({
          title: "Report reason required",
          description: "Please provide a reason for reporting this property.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from("user_reports")
        .insert({
          reporter_id: sUser.id,
          reported_user_id: property?.user_id,
          reason: reportReason.trim()
        });

      if (error) throw error;

      toast({
        title: "Property reported",
        description: "Your report has been submitted and will be reviewed by our team."
      });

      setIsReportDialogOpen(false);
      setReportReason("");
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Error",
        description: e.message || "Failed to submit report"
      });
    }
  };

  const canEdit = user && (
    property?.user_id === user.id || 
    userRole === 'admin' || 
    userRole === 'moderator'
  );

  // Calculate display price based on halal financing parameters with proper reactivity
  const displayPrice = useMemo(() => {
    if (!property) return 0;
    
    // Check if we have valid halal financing parameters
    const hasValidFinancing = financingStore.cashAvailable && 
                             financingStore.periodMonths && 
                             financingStore.isHalalMode;
    
    if (hasValidFinancing) {
      const cashAvailable = parseFloat(financingStore.cashAvailable || '0');
      const periodMonths = parseInt(financingStore.periodMonths || '0');
      
      // If cash available > property price, just show property price
      if (cashAvailable >= property.price) {
        return property.price;
      }
      
      // Ensure we have valid numeric values and minimum cash requirement
      if (cashAvailable > 0 && periodMonths > 0 && cashAvailable >= property.price * 0.5) {
        const calculation = calculateHalalFinancing(cashAvailable, property.price, periodMonths);
        // Show total cost = cash upfront + financed amount + fees
        const totalCost = cashAvailable + calculation.totalCost;
        console.log('Price calculation:', {
          propertyPrice: property.price,
          cashAvailable,
          periodMonths,
          calculation,
          totalCost
        });
        return totalCost;
      }
    }
    
    // Default to property base price
    return property.price;
  }, [
    financingStore.cashAvailable, 
    financingStore.periodMonths, 
    financingStore.isHalalMode,
    property?.price
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <MagitLogo size="lg" isLoading={true} />
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-32 mx-auto mt-4"></div>
          </div>
          <div className="mt-3 text-sm text-muted-foreground/70">
            Loading property details...
          </div>
          <div className="mt-2 text-xs text-muted-foreground/50">
            If this takes too long, please refresh the page
          </div>
        </div>
      </div>
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
                {t('nav.signIn')}
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
                        <Carousel className="w-full relative">
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
                                  {idx === 0 && property.is_halal_available && property.halal_status === 'approved' && (
                                    <div className="absolute bottom-3 right-3">
                                      <Badge variant="trust">{t('property.halalFinancing')}</Badge>
                                    </div>
                                  )}
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
                          <CarouselPrevious className="left-4" />
                          <CarouselNext className="right-4" />
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
                      <Button variant={isSaved ? "success" : "outline"} size="sm" onClick={toggleSave} aria-label={isSaved ? t('property.saved') : t('property.save')}>
                        <Heart className="h-4 w-4 mr-2" /> {isSaved ? t('property.saved') : t('property.save')}
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center"><MapPin className="h-4 w-4 mr-1" /> {t('property.location')}: {property.location}</span>
                    {property.is_verified && (<Badge variant="success">Verified</Badge>)}
                  </div>
                  <div className="flex items-center gap-6 text-muted-foreground">
                     {property.bedrooms != null && (<span className="inline-flex items-center"><Bed className="h-4 w-4 mr-1" /> {property.bedrooms} {property.bedrooms === 1 ? t('property.bed') : t('property.beds')}</span>)}
                     {property.bathrooms != null && (<span className="inline-flex items-center"><Bath className="h-4 w-4 mr-1" /> {property.bathrooms} {property.bathrooms === 1 ? t('property.bath') : t('property.baths')}</span>)}
                     {property.area != null && (<span className="inline-flex items-center"><Square className="h-4 w-4 mr-1" /> {property.area} {t('property.sqm')}</span>)}
                     {property.property_type === 'house' && property.land_area_sotka != null && (<span className="inline-flex items-center"><MapPin className="h-4 w-4 mr-1" /> {property.land_area_sotka} {t('property.sotka')}</span>)}
                   </div>
                   <PriceOdometer 
                     value={displayPrice}
                     className="text-3xl font-bold text-primary"
                   />
                  {property.description && (
                    <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{property.description}</p>
                  )}
                </CardContent>
              </Card>

              {/* Property Location Map */}
              {property.latitude && property.longitude && (
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold">{t('property.locationHeading')}</h3>
                    <PropertyLocationMap
                      latitude={property.latitude}
                      longitude={property.longitude}
                      title={property.title}
                      language={language}
                      className="w-full h-64 rounded-lg"
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:w-1/3 w-full space-y-6">
              {/* Edit button for property owner or moderators/admins */}
              {canEdit && (
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold">{t('property.manageProperty')}</h3>
                    <div className="space-y-3">
                      <Button 
                        className="w-full" 
                        onClick={() => setIsEditDialogOpen(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {t('property.editProperty')}
                      </Button>
                      {user?.id === property.user_id && (
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          onClick={() => {
                            if (confirm(t('property.deleteConfirm'))) {
                              supabase.from('properties').delete().eq('id', property.id).then(() => {
                                toast({ title: t('property.deleted'), description: t('property.deletedDescription') });
                                navigate('/my-properties');
                              });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('property.deleteProperty')}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Visitor actions (or if not owner/admin) */}
              {!canEdit && (
                // Visitor view - show visit/message/report options
                <>
                  {/* Actions - Request Visit */}
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{t('actions.title')}</h3>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium inline-flex items-center"><CalendarIcon className="h-4 w-4 mr-2" /> {t('actions.requestVisit')}</label>

                    {/* Step 1: Choose date */}
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">1. {t('actions.chooseDate')}</div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start font-normal">
                            {dateOnly ? format(dateOnly, "PPP") : <span>{t('actions.pickDate')}</span>}
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
                      <div className="text-xs text-muted-foreground">2. {t('actions.chooseTime')}</div>
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
                          <div className="text-xs text-muted-foreground">{dateOnly ? t('actions.noTimesForDate') : t('actions.pickDateFirst')}</div>
                        )}
                      </div>
                    </div>

                    {/* Step 3: Request other time with deposit info */}
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">3. {t('actions.requestOtherTime')}</div>
                      <div className="flex items-start gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSlot("");
                            setShowCustomTime((v) => !v);
                          }}
                        >
                          {showCustomTime ? t('actions.cancelOtherTime') : t('actions.requestOtherTimeButton')}
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
                            <span className="text-xs text-muted-foreground">{dateOnly ? t('actions.pickPreferredTime') : t('actions.pickDateFirst')}</span>
                          </div>
                        )}
                      </div>
                      {showCustomTime && (
                        <div className="text-xs text-muted-foreground">{t('actions.depositInfo')}</div>
                      )}
                    </div>

                        <VisitLimitChecker
                          propertyId={id!}
                          onRequestSubmit={(visitDate) => {
                            requestVisit();
                          }}
                        >
                          <Button 
                            className="w-full"
                            disabled={visitRequestSent}
                          >
                            {visitRequestSent ? t('actions.requestSent') : 
                             (showCustomTime && timeOnly && dateOnly ? t('actions.sendRequestDeposit') : t('actions.sendRequest'))}
                          </Button>
                        </VisitLimitChecker>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Message Owner */}
                  <Card>
                    <CardContent className="p-6 space-y-3">
                      <h3 className="font-semibold inline-flex items-center"><MessageCircle className="h-4 w-4 mr-2" /> {t('property.messageOwner')}</h3>
                      <div className="text-sm text-muted-foreground">{property.profiles?.full_name || property.profiles?.email}</div>
                      <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('property.writeMessage')} rows={4} />
                      <Button className="w-full" onClick={sendMessage}>{t('property.sendMessage')}</Button>
                    </CardContent>
                  </Card>

                  {/* Contact Seller - Show only to authenticated users */}
                  {user ? (
                    <Card>
                      <CardContent className="p-6 space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Phone className="w-5 h-5" />
                          {t('contact.title')}
                        </h3>
                        {property.show_phone && property.profiles?.phone ? (
                          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Phone className="w-5 h-5 text-green-600" />
                              <div>
                                <p className="text-sm text-muted-foreground">{t('contact.sellerPhone')}</p>
                                <a 
                                  href={`tel:+998${property.profiles.phone}`}
                                  className="text-lg font-semibold text-green-600 hover:text-green-700"
                                >
                                  +998 {property.profiles.phone}
                                </a>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(`tel:+998${property.profiles.phone}`, '_self')}
                            >
                              {t('contact.callNow')}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                            <MessageCircle className="w-5 h-5 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {t('contact.preferMessages')}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-6 space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Phone className="w-5 h-5" />
                          {t('contact.title')}
                        </h3>
                        <div className="flex flex-col items-center gap-3 p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground text-center">
                            {t('contact.signInRequired')}
                          </p>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => navigate('/auth')}
                          >
                            {t('contact.signInButton')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Seller Profile */}
                  {user && property.profiles && (
                    <SellerProfileCard 
                      profile={property.profiles} 
                      currentPropertyId={id!}
                    />
                  )}

                  {/* Halal Financing Breakdown - only show when halal mode is ON and property supports it */}
                  {isHalalMode && property.is_halal_available && property.halal_status === 'approved' && (
                    <HalalFinancingBreakdown 
                      propertyPrice={property.price}
                      onRequestFinancing={(cashAvailable, periodMonths) => {
                        handleRequestFinancing(cashAvailable, periodMonths);
                      }}
                      initialCashAvailable={financingStore.cashAvailable}
                      initialPeriodMonths={financingStore.periodMonths}
                    />
                  )}

                  <Card>
                    <CardContent className="p-6">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => setIsReportDialogOpen(true)}
                      >
                         <Flag className="h-4 w-4 mr-2" />
                         {t('property.reportProperty')}
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
              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 right-4 z-50 bg-background/80 backdrop-blur-sm"
                onClick={() => setLightboxOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <Carousel className="w-full" opts={{ startIndex: lightboxIndex }}>
                <CarouselContent>
                  {images.map((src, idx) => (
                    <CarouselItem key={idx} className="flex items-center justify-center bg-black">
                      <img 
                        src={src} 
                        alt={`${property.title} ${idx + 1}`} 
                        className="max-h-[80vh] w-auto object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg'
                        }}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </DialogContent>
        </Dialog>

        {/* Property Edit Dialog */}
        <PropertyEditDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          property={property}
          onPropertyUpdate={handlePropertyUpdate}
        />
      </main>

      {/* Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Report Property</h2>
              <p className="text-sm text-muted-foreground">
                Please provide a reason for reporting this property. Our team will review your report.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-reason">Reason for reporting</Label>
              <Textarea
                id="report-reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Please describe why you are reporting this property..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsReportDialogOpen(false);
                  setReportReason("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleReportProperty}>
                Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PropertyDetails;
