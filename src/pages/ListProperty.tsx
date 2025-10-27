import { useState, useRef, ChangeEvent, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { MagitLogo } from "@/components/MagitLogo";
import { PaymentMethods } from "@/components/PaymentMethods";
import { Footer } from "@/components/Footer";
import { LiquidProgressButton } from "@/components/ui/liquid-progress-button";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LocationPicker from "@/components/LocationPicker";
import { Home, Upload, FileText, Shield, Calendar, CheckCircle, ArrowRight, MapPin, Camera, User, Phone, Mail, Save, Trash2, GripVertical, X } from "lucide-react";
import { extractDistrictFromText, getDistrictOptionsForCity } from "@/lib/districts";
import { extractCityFromText, getCityOptions, type CityKey } from "@/lib/cities";
import { getRegionOptions, getCitiesForRegion, type RegionKey, localizeRegion } from "@/lib/regions";
import { debounce } from "@/utils/debounce";
import { convertImagesToJpeg } from "@/utils/imageConverter";
import { SortablePhotoItem } from "@/components/SortablePhotoItem";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
const sanitizeFilename = (name: string) => {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot).toLowerCase() : "";
  const cleaned = base.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const ascii = cleaned
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$|^\.+|\.+$/g, "")
    .toLowerCase();
  return (ascii || "file") + ext;
};

const ListProperty = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [submissionCurrentStep, setSubmissionCurrentStep] = useState("");
  const [formData, setFormData] = useState({
    // Property Details
    displayName: "",
    propertyType: "",
    address: "",
    region: "",
    city: "",
    district: "",
    districtOther: "", // Manual district entry when "Other" is selected
    price: "",
    bedrooms: "",
    customBedrooms: "",
    bathrooms: "",
    customBathrooms: "",
    area: "", // Living area for all properties
    landAreaSotka: "", // Land area in соток for houses only
    description: "",
    // Location
    latitude: null as number | null,
    longitude: null as number | null,
    // Documents
    documents: [] as File[],
    photos: [] as File[],
    // Visit Hours
    visitHours: [] as string[],
    // Halal Financing
    halalFinancingRequested: false
  });
  const totalSteps = 5;

  // Persistence constants
  const STORAGE_KEY = 'magit_property_draft';
  const STEP_KEY = 'magit_property_step';

  // Load saved data on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const savedStep = localStorage.getItem(STEP_KEY);
      const urlStep = searchParams.get('step');
      
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Only restore non-file data
        const { photos, documents, ...restData } = parsed;
        setFormData(prev => ({ 
          ...prev, 
          ...restData,
          displayName: restData.displayName || "",
          landAreaSotka: restData.landAreaSotka || ""
        }));
        setLastSaved(new Date().toLocaleTimeString());
      }
      
      if (urlStep && !isNaN(Number(urlStep))) {
        setCurrentStep(Math.max(1, Math.min(Number(urlStep), totalSteps)));
      } else if (savedStep && !isNaN(Number(savedStep))) {
        setCurrentStep(Math.max(1, Math.min(Number(savedStep), totalSteps)));
      }
    } catch (error) {
      console.warn('Failed to load saved draft:', error);
    }
  }, [searchParams]);

  // Debounced save function
  const saveToStorage = useCallback(
    debounce((data: typeof formData, step: number) => {
      try {
        // Save form data (excluding files)
        const { photos, documents, ...dataToSave } = data;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...dataToSave,
          displayName: dataToSave.displayName || "",
          landAreaSotka: dataToSave.landAreaSotka || ""
        }));
        localStorage.setItem(STEP_KEY, step.toString());
        setLastSaved(new Date().toLocaleTimeString());
      } catch (error) {
        console.warn('Failed to save draft:', error);
      }
    }, 5000), // Auto-save every 5 seconds
    []
  );

  // Save on form data changes
  useEffect(() => {
    saveToStorage(formData, currentStep);
  }, [formData, currentStep, saveToStorage]);

  // Save draft before page closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToStorage.flush();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveToStorage]);

  // Update URL with current step
  const updateStepInUrl = (step: number) => {
    setSearchParams(prev => {
      prev.set('step', step.toString());
      return prev;
    }, { replace: true });
  };
  
  // Form validation
  const validateBeforeSubmit = () => {
    const errors: string[] = [];
    const price = Number(formData.price);
    const area = Number(formData.area);
    const bedrooms = formData.bedrooms === 'custom' ? Number(formData.customBedrooms) : Number(formData.bedrooms);
    const bathrooms = formData.bathrooms === 'custom' ? Number(formData.customBathrooms) : Number(formData.bathrooms);

    if (!formData.displayName.trim()) errors.push('Please enter a property name');
    if (!formData.propertyType) errors.push('Please select a property type');
    if (!formData.address) errors.push('Please enter the property address');
    if (!Number.isFinite(price) || price <= 0) errors.push('Please enter a valid price');
    if (!Number.isFinite(area) || area <= 0) errors.push('Please enter a valid living area');
    if ((formData.propertyType === 'house' || formData.propertyType === 'commercial') && (!formData.landAreaSotka || Number(formData.landAreaSotka) <= 0)) {
      errors.push('Please enter a valid land area in соток for houses and commercial properties');
    }
    if (!['land', 'commercial'].includes(formData.propertyType) && (!Number.isFinite(bedrooms) || bedrooms < 0)) {
      errors.push('Please specify bedrooms');
    }
    if (formData.propertyType !== 'land' && (!Number.isFinite(bathrooms) || bathrooms < 1)) {
      errors.push('Please specify bathrooms');
    }
    if (!formData.latitude || !formData.longitude) errors.push('Please select the property location on the map');
    if (formData.photos.length < 5) errors.push('Please upload at least 5 photos (max 20)');
    if (formData.visitHours.length === 0) errors.push('Please select at least one visit time');

    return errors;
  };
  const nextStep = () => {
    // Photo validation for step 3
    if (currentStep === 3 && formData.photos.length < 5) {
      toast({
        title: "Photos Required",
        description: "Please upload at least 5 photos before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < totalSteps) {
      // Immediately save before changing step
      saveToStorage.flush();
      setCurrentStep(currentStep + 1);
      updateStepInUrl(currentStep + 1);
    }
  };
  const prevStep = () => {
    if (currentStep > 1) {
      // Immediately save before changing step
      saveToStorage.flush();
      const prevStepNum = currentStep - 1;
      setCurrentStep(prevStepNum);
      updateStepInUrl(prevStepNum);
    }
  };
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Draft management functions
  const clearDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STEP_KEY);
      setLastSaved(null);
      toast({ title: "Draft cleared", description: "Form has been reset to empty state." });
      // Reset form
      setFormData({
        displayName: "",
        propertyType: "",
        address: "",
        region: "",
        city: "",
        district: "",
        districtOther: "",
        price: "",
        bedrooms: "",
        customBedrooms: "",
        bathrooms: "",
        customBathrooms: "",
        area: "",
        landAreaSotka: "",
        description: "",
        latitude: null,
        longitude: null,
        documents: [],
        photos: [],
        visitHours: [],
        halalFinancingRequested: false
      });
      setCurrentStep(1);
      updateStepInUrl(1);
    } catch (error) {
      console.warn('Failed to clear draft:', error);
    }
  };

  const saveDraft = () => {
    saveToStorage.flush();
    toast({ title: "Draft saved", description: "Your progress has been saved." });
  };

  // Calculate total amount based on selected features
  const calculateTotalAmount = () => {
    return 0; // No paid features
  };
  // Photo upload helpers
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChoosePhotos = () => {
    fileInputRef.current?.click();
  };

  const handlePhotosSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;

    try {
      // Convert all new files to JPEG first
      const convertedFiles = await convertImagesToJpeg(newFiles);

      // Merge with existing, de-duplicate, and cap at 20 (keep earliest)
      const existing = formData.photos;
      const merged = [...existing, ...convertedFiles];
      const seen = new Set<string>();
      const deduped: File[] = [];
      for (const f of merged) {
        const key = `${f.name}_${f.size}_${(f as any).lastModified ?? ''}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(f);
        }
      }
      const finalPhotos = deduped.slice(0, 20);

      if (deduped.length > 20) {
        toast({ title: "Too many photos", description: "Maximum is 20 photos. Keeping the first 20.", variant: "destructive" });
      }

      setFormData(prev => ({ ...prev, photos: finalPhotos }));

      toast({ 
        title: "Photos converted", 
        description: `${convertedFiles.length} photo(s) converted to JPEG format.` 
      });
    } catch (error) {
      console.error('Error converting photos:', error);
      toast({ 
        title: "Conversion failed", 
        description: "Some photos could not be converted. Please try again.", 
        variant: "destructive" 
      });
    }

    // Reset input so selecting the same files again triggers change
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (e.target) e.target.value = "";
  };

  const handlePhotoDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = parseInt(active.id as string);
      const newIndex = parseInt(over?.id as string);

      const reorderedPhotos = arrayMove(formData.photos, oldIndex, newIndex);
      setFormData(prev => ({ ...prev, photos: reorderedPhotos }));
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };
  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    setSubmissionProgress(0);
    setSubmissionCurrentStep("Validating information");
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit an application",
          variant: "destructive",
        });
        return;
      }

      // Validate
      const validationErrors = validateBeforeSubmit();
      if (validationErrors.length) {
        toast({ title: "Missing information", description: validationErrors[0], variant: "destructive" });
        const targetStep = (!formData.latitude || !formData.longitude) ? 2 : (formData.photos.length < 5 ? 3 : 1);
        setCurrentStep(targetStep);
        setSubmissionProgress(0);
        setSubmissionCurrentStep("");
        return;
      }

      setSubmissionProgress(10);
      setSubmissionCurrentStep("Creating property listing");

      const bedroomCount = formData.bedrooms === "custom" ? 
        Number(formData.customBedrooms) : Number(formData.bedrooms);
      const bathroomCount = formData.bathrooms === "custom" ? 
        Number(formData.customBathrooms) : Number(formData.bathrooms);

      const insertPayload: any = {
        user_id: user.user.id,
        title: formData.displayName,
        display_name: formData.displayName,
        location: formData.address,
        city: formData.city || extractCityFromText(formData.address) || 'Tashkent',
        property_type: formData.propertyType,
        price: parseFloat(formData.price),
        bedrooms: bedroomCount,
        bathrooms: bathroomCount,
        area: parseFloat(formData.area),
        land_area_sotka: (formData.propertyType === 'house' || formData.propertyType === 'commercial') && formData.landAreaSotka ? parseFloat(formData.landAreaSotka) : null,
        description: formData.description,
        visit_hours: formData.visitHours,
        
        latitude: formData.latitude,
        longitude: formData.longitude,
        is_halal_available: formData.halalFinancingRequested,
        halal_status: formData.halalFinancingRequested ? 'pending_approval' : 'disabled',
        district: formData.district === 'Other' ? formData.districtOther : (formData.district || extractDistrictFromText(formData.address)),
        status: 'pending'
      };

      const { data: property, error } = await supabase
        .from('properties')
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;

      setSubmissionProgress(15);
      setSubmissionCurrentStep("Uploading photos");

      // Upload photos to Storage and update property row
      if (property && formData.photos.length > 0) {
        const uploadedUrls: string[] = [];
        for (let i = 0; i < formData.photos.length; i++) {
          const file = formData.photos[i];
          const photoProgress = 15 + ((i / formData.photos.length) * 70); // 15% to 85%
          setSubmissionProgress(photoProgress);
          setSubmissionCurrentStep(`Uploading photo ${i + 1} of ${formData.photos.length}`);
          
          // All files are now JPEG, so use .jpg extension
          const filePath = `${user.user.id}/${property.id}/${Date.now()}_${i}.jpg`;
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('properties')
            .upload(filePath, file, { contentType: 'image/jpeg', upsert: false });
          if (uploadError) {
            console.error('Upload failed for', filePath, uploadError);
            throw uploadError;
          }
          const { data: publicUrlData } = supabase
            .storage
            .from('properties')
            .getPublicUrl(filePath);
          uploadedUrls.push(publicUrlData.publicUrl);
        }

        setSubmissionProgress(85);
        setSubmissionCurrentStep("Updating property details");
        
        await supabase
          .from('properties')
          .update({ image_url: uploadedUrls[0] ?? null, photos: uploadedUrls })
          .eq('id', property.id);
      }

      // Submit halal financing request if requested
      if (formData.halalFinancingRequested && property) {
        setSubmissionProgress(95);
        setSubmissionCurrentStep("Setting up halal financing");
        const { error: halalError } = await supabase
          .from('halal_financing_requests')
          .insert({
            property_id: property.id,
            user_id: user.user.id,
            request_notes: 'Halal financing requested during property listing'
          });
        
        if (halalError) {
          console.error('Error submitting halal financing request:', halalError);
        }
      }

      setSubmissionProgress(98);
      setSubmissionCurrentStep("Finalizing submission");
      
      // Clear draft after successful submission
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STEP_KEY);
        setLastSaved(null);
      } catch {}

      setSubmissionProgress(100);
      setSubmissionCurrentStep("Application submitted");
      setApplicationSubmitted(true);
      
      toast({
        title: "Success",
        description: formData.halalFinancingRequested 
          ? "Your property application and halal financing request have been submitted for review"
          : "Your property application has been submitted for review",
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      if (!applicationSubmitted) {
        setSubmissionProgress(0);
        setSubmissionCurrentStep("");
      }
    }
  };
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                {t('listProperty.propertyInformation')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                  <div>
                <Label htmlFor="displayName">{t('listProperty.propertyName')}</Label>
                <Input 
                  id="displayName" 
                  name="property-title"
                  placeholder={t('listProperty.propertyName')} 
                  value={formData.displayName || ""} 
                  onChange={e => handleInputChange("displayName", e.target.value)}
                  autoComplete="new-password"
                  spellCheck={false}
                />
              </div>
              
              <div>
                <Label htmlFor="propertyType">{t('listProperty.propertyType')}</Label>
                <Select value={formData.propertyType} onValueChange={value => handleInputChange("propertyType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('listProperty.selectPropertyType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">{t('listProperty.apartment')}</SelectItem>
                    <SelectItem value="house">{t('listProperty.house')}</SelectItem>
                    <SelectItem value="studio">{t('listProperty.studio')}</SelectItem>
                    <SelectItem value="commercial">{t('listProperty.commercial')}</SelectItem>
                    <SelectItem value="land">{t('listProperty.land')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Region Selection */}
              <div>
                <Label htmlFor="region">{t('listProperty.region')}</Label>
                <Select 
                  value={formData.region} 
                  onValueChange={value => {
                    handleInputChange("region", value);
                    // Reset city and district when region changes
                    handleInputChange("city", "");
                    handleInputChange("district", "");
                    handleInputChange("districtOther", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('listProperty.selectRegion')} />
                  </SelectTrigger>
                  <SelectContent>
                    {getRegionOptions(language).map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City Selection */}
              {formData.region && (
                <div>
                  <Label htmlFor="city">{t('listProperty.city')}</Label>
                  <Select 
                    value={formData.city} 
                    onValueChange={value => {
                      handleInputChange("city", value);
                      // Reset district when city changes
                      handleInputChange("district", "");
                      handleInputChange("districtOther", "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('listProperty.selectCity')} />
                    </SelectTrigger>
                    <SelectContent>
                      {getCitiesForRegion(formData.region as RegionKey).map(cityKey => {
                        const cityOptions = getCityOptions(language);
                        const cityOption = cityOptions.find(c => c.value === cityKey);
                        return (
                          <SelectItem key={cityKey} value={cityKey}>
                            {cityOption?.label || cityKey}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* District Selection */}
              {formData.city && (
                <div>
                  <Label htmlFor="district">{t('listProperty.district')}</Label>
                  <Select 
                    value={formData.district} 
                    onValueChange={value => {
                      handleInputChange("district", value);
                      if (value !== 'Other') {
                        handleInputChange("districtOther", "");
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('listProperty.selectDistrict')} />
                    </SelectTrigger>
                    <SelectContent>
                      {getDistrictOptionsForCity(formData.city, language).map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Manual District Entry for "Other" */}
              {formData.district === 'Other' && (
                <div>
                  <Label htmlFor="districtOther">{t('listProperty.districtOtherLabel')}</Label>
                  <Input 
                    id="districtOther" 
                    placeholder={t('listProperty.districtOtherPlaceholder')} 
                    value={formData.districtOther} 
                    onChange={e => handleInputChange("districtOther", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('listProperty.districtOtherNote')}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="address">{t('listProperty.propertyAddress')}</Label>
                <Input 
                  id="address" 
                  name="property-address"
                  placeholder={t('listProperty.addressPlaceholder')} 
                  value={formData.address} 
                  onChange={e => handleInputChange("address", e.target.value)}
                  autoComplete="new-password"
                  spellCheck={false}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">{t('listProperty.price')}</Label>
                  <Input id="price" type="number" placeholder="0" value={formData.price} onChange={e => handleInputChange("price", e.target.value)} />
                </div>
                 <div>
                   <Label htmlFor="area">
                     {formData.propertyType === 'commercial' ? t('listProperty.livingArea') :
                      formData.propertyType === 'land' ? t('listProperty.landArea') :
                      formData.propertyType === 'house' ? t('listProperty.livingArea') :
                      t('listProperty.area')}
                   </Label>
                   <Input id="area" type="number" placeholder="0" value={formData.area} onChange={e => handleInputChange("area", e.target.value)} />
                 </div>
              </div>
              
               {(formData.propertyType === 'house' || formData.propertyType === 'commercial') && (
                 <div>
                   <Label htmlFor="landAreaSotka">{t('listProperty.landArea')}</Label>
                   <Input 
                     id="landAreaSotka" 
                     type="number" 
                     placeholder="0" 
                     value={formData.landAreaSotka} 
                     onChange={e => handleInputChange("landAreaSotka", e.target.value)} 
                   />
                 </div>
               )}
              
                {/* Bedrooms - only for apartments, houses, and studios */}
                {!['land', 'commercial'].includes(formData.propertyType) && (
                  <div>
                    <Label htmlFor="bedrooms">{t('listProperty.bedrooms')}</Label>
                    <div className="space-y-2">
                      <Select value={formData.bedrooms} onValueChange={value => handleInputChange("bedrooms", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('listProperty.selectBedrooms')} />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4, 5, 6].map(num => <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? t('listProperty.bedroom') : t('listProperty.bedroomsPlural')}</SelectItem>)}
                          <SelectItem value="custom">{t('listProperty.otherCustom')}</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.bedrooms === "custom" && <Input 
                        type="number" 
                        name="custom-bedrooms"
                        placeholder={t('listProperty.enterBedrooms')} 
                        min="0" 
                        value={formData.customBedrooms} 
                        autoFocus 
                        onChange={e => handleInputChange("customBedrooms", e.target.value)}
                        autoComplete="off"
                      />}
                    </div>
                  </div>
                )}
                
                {/* Bathrooms - for all except land */}
                {formData.propertyType !== 'land' && (
                  <div>
                    <Label htmlFor="bathrooms">{t('listProperty.bathrooms')}</Label>
                    <div className="space-y-2">
                      <Select value={formData.bathrooms} onValueChange={value => handleInputChange("bathrooms", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('listProperty.selectBathrooms')} />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map(num => <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? t('listProperty.bathroom') : t('listProperty.bathroomsPlural')}</SelectItem>)}
                          <SelectItem value="custom">{t('listProperty.otherCustom')}</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.bathrooms === "custom" && <Input 
                        type="number" 
                        name="custom-bathrooms"
                        placeholder={t('listProperty.enterBathrooms')} 
                        min="1" 
                        value={formData.customBathrooms} 
                        autoFocus 
                        onChange={e => handleInputChange("customBathrooms", e.target.value)}
                        autoComplete="off"
                      />}
                    </div>
                  </div>
                )}
              
              <div>
                <Label htmlFor="description">{t('listProperty.propertyDescription')}</Label>
                <Textarea id="description" placeholder={t('listProperty.descriptionPlaceholder')} value={formData.description} onChange={e => handleInputChange("description", e.target.value)} rows={4} />
              </div>

              <div>
                <Label htmlFor="visitHours">{t('listProperty.comfortableVisitHours')}</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('listProperty.visitHoursDescription')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00",
                    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", 
                    "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
                  ].map((time) => {
                    const isInconvenientTime = (time >= "00:00" && time <= "08:00") || (time >= "21:00" && time <= "23:00");
                    return (
                    <div key={time} className="flex items-center space-x-2">
                      <Checkbox
                        id={`time-${time}`}
                        checked={formData.visitHours.includes(time)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              visitHours: [...prev.visitHours, time]
                            }))
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              visitHours: prev.visitHours.filter(t => t !== time)
                            }))
                          }
                        }}
                      />
                      <Label htmlFor={`time-${time}`} className={`text-sm cursor-pointer ${isInconvenientTime ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                        {time} {isInconvenientTime ? '⚠️' : ''}
                      </Label>
                    </div>
                  )})}
                </div>
                {formData.visitHours.length === 0 && (
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                    {t('listProperty.selectTimeSlot')}
                  </p>
                )}
                {formData.visitHours.some(time => (time >= "00:00" && time <= "08:00") || (time >= "21:00" && time <= "23:00")) && (
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-2 bg-orange-50 dark:bg-orange-950/20 p-2 rounded border border-orange-200 dark:border-orange-800">
                    ⚠️ Late night/early morning hours may be inconvenient for visitors. Consider offering daytime hours as well.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>;
      case 2:
        return <LocationPicker 
          onLocationSelect={(lat, lng, address) => {
            const detectedDistrict = extractDistrictFromText(address || '');
            const detectedCity = extractCityFromText(address || '');
            setFormData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              address: address || prev.address,
              district: prev.district || (detectedDistrict !== 'Other' ? detectedDistrict : ''),
              city: detectedCity || prev.city || 'Tashkent'
            }));
          }}
          selectedLat={formData.latitude || undefined}
          selectedLng={formData.longitude || undefined}
          initialAddress={formData.address}
          expectedRegion={formData.region as RegionKey | undefined}
          expectedCity={formData.city as CityKey | undefined}
          expectedDistrict={formData.district || undefined}
          onValidationError={(message) => {
            toast({
              title: t('address.validationWarning'),
              description: message,
              variant: "destructive",
            });
          }}
        />;
      case 3:
        return <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                {t('listProperty.propertyPhotos')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t('listProperty.uploadPropertyPhotos')}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {t('listProperty.uploadDescription')}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotosSelected}
                />
                <Button variant="outline" onClick={handleChoosePhotos}>
                  {t('listProperty.choosePhotos')}
                </Button>
                <p className={`text-sm mt-2 ${formData.photos.length < 5 ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'}`}>
                  {t('listProperty.selectedPhotos').replace('{count}', formData.photos.length.toString())}
                </p>
                {formData.photos.length < 5 && (
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                    Upload at least {5 - formData.photos.length} more photo(s) to continue
                  </p>
                )}
              </div>

              {formData.photos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Drag photos to reorder • {formData.photos.length}/20 photos
                  </p>
                  
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handlePhotoDragEnd}
                  >
                    <SortableContext items={formData.photos.map((_, i) => i.toString())} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {formData.photos.map((file, i) => (
                          <SortablePhotoItem
                            key={i}
                            id={i.toString()}
                            file={file}
                            index={i}
                            onRemove={() => removePhoto(i)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">{t('listProperty.photoGuidelines')}</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>{t('listProperty.includeExteriorInterior')}</li>
                  <li>{t('listProperty.showAllRooms')}</li>
                  <li>{t('listProperty.useGoodLighting')}</li>
                  <li>{t('listProperty.photoLimits')}</li>
                </ul>
              </div>
            </CardContent>
          </Card>;
      case 4:
        return <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t('listProperty.requiredDocuments')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{t('listProperty.propertyTitle')}</h4>
                      <p className="text-sm text-muted-foreground">{t('listProperty.proofOfOwnership')}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      {t('listProperty.upload')}
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{t('listProperty.passportId')}</h4>
                      <p className="text-sm text-muted-foreground">{t('listProperty.ownerIdentification')}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      {t('listProperty.upload')}
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{t('listProperty.propertyAssessment')}</h4>
                      <p className="text-sm text-muted-foreground">{t('listProperty.officialValuation')}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      {t('listProperty.upload')}
                    </Button>
                  </div>
                </div>
              </div>
              

              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    id="halalFinancing" 
                    checked={formData.halalFinancingRequested}
                    disabled={formData.propertyType === 'commercial' || formData.propertyType === 'land'}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, halalFinancingRequested: checked as boolean }))}
                  />
                  <div className="flex-1">
                    <Label htmlFor="halalFinancing" className="font-semibold text-sm text-green-900 dark:text-green-100 cursor-pointer">{t('listProperty.halalFinancingAvailable')}</Label>
                    <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                      {t('listProperty.halalFinancingDescription')}
                    </p>
                    
                    {(formData.propertyType === 'commercial' || formData.propertyType === 'land') && (
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-2 bg-amber-50 dark:bg-amber-950/20 p-2 rounded border border-amber-200 dark:border-amber-800">
                        ⚠️ {t('listProperty.halalFinancingNotAvailable')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>;
      case 5:
        return <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Review & Submit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contact Preferences - NEW */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    {t('listProperty.contactInformation')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                </CardContent>
              </Card>

              <div className="bg-gradient-card p-6 rounded-lg">
                <h3 className="font-semibold mb-4">{t('listProperty.applicationSummary')}</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('listProperty.propertyTypeLabel')}</span>
                    <span className="capitalize">{formData.propertyType || t('listProperty.notSpecified')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('listProperty.addressLabel')}</span>
                    <span>{formData.address || t('listProperty.notSpecified')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('listProperty.priceLabel')}</span>
                    <span>{formData.price ? `$${formData.price}` : t('listProperty.notSpecified')}</span>
                  </div>
                  {formData.latitude && formData.longitude && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('listProperty.location')}</span>
                      <span>{t('listProperty.coordinatesSet')}</span>
                    </div>
                  )}
                  {formData.halalFinancingRequested && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('listProperty.halalFinancingLabel')}</span>
                      <span className="text-green-600">{t('listProperty.requested')}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-green-900 dark:text-green-100 mb-2">
                      {t('listProperty.whatHappensNext')}
                    </h4>
                    <ul className="text-sm text-green-700 dark:text-green-200 space-y-1">
                      <li>{t('listProperty.documentReview')}</li>
                      <li>{t('listProperty.propertyVerification')}</li>
                      <li>{t('listProperty.listingGoesLive')}</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              
              {applicationSubmitted && (
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg mt-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm text-green-900 dark:text-green-100 mb-2">
                        {t('listProperty.applicationUnderReview')}
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-200">
                        {t('listProperty.reviewNotification')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>;
      default:
        return null;
    }
  };
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div 
              className="cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <MagitLogo size="md" />
            </div>
            <div className="flex items-center gap-4">
              {lastSaved && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {t('listProperty.saved').replace('{time}', lastSaved)}
                </span>
              )}
              <Button variant="ghost" onClick={() => navigate('/')}>
                {t('listProperty.backToHome')}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-12 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="success" className="mb-4">
              {t('listProperty.sellerPortal')}
            </Badge>
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
              {t('listProperty.listYourProperty').split('Magit')[0]}<span className="text-primary">Magit</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t('listProperty.marketplaceDescription')}
            </p>
            
            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{t('listProperty.stepProgress').replace('{current}', currentStep.toString()).replace('{total}', totalSteps.toString())}</span>
                <span className="text-sm text-muted-foreground">{t('listProperty.percentComplete').replace('{percent}', Math.round(currentStep / totalSteps * 100).toString())}</span>
              </div>
              <div className="w-full bg-muted/20 rounded-full h-4 relative overflow-hidden border-2 border-border/60">
                <div 
                  className="h-full rounded-full transition-all duration-500 relative bg-gradient-to-r from-[hsl(25,85%,53%)] to-[hsl(38,84%,60%)] shadow-[0_0_20px_hsl(25,85%,53%/0.4)]" 
                  style={{ width: `${currentStep / totalSteps * 100}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_ease-in-out_infinite] transform -skew-x-12 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              <div className="flex gap-2">
                <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                  {t('listProperty.previous')}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={saveDraft}
                  className="flex items-center gap-1"
                >
                  <Save className="w-4 h-4" />
                  {t('listProperty.saveDraft')}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={clearDraft}
                  className="flex items-center gap-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('listProperty.clearDraft')}
                </Button>
              </div>
              
              {currentStep < totalSteps ? <Button 
                  onClick={nextStep} 
                  className="flex items-center gap-2"
                  disabled={currentStep === 3 && formData.photos.length < 5}
                >
                  {t('listProperty.nextStep')}
                  <ArrowRight className="w-4 h-4" />
                </Button> : <LiquidProgressButton
                  variant="success"
                  className="flex items-center gap-2"
                  onClick={handleSubmitApplication}
                  disabled={isSubmitting || applicationSubmitted}
                  isLoading={isSubmitting}
                  progress={submissionProgress}
                  loadingText={submissionCurrentStep}
                >
                  {applicationSubmitted ? t('listProperty.applicationSubmitted') : t('listProperty.completeApplication')}
                  <CheckCircle className="w-4 h-4" />
                </LiquidProgressButton>}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading font-bold text-2xl text-center mb-8">
              {t('listProperty.whyListWithMagit')}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Shield className="w-8 h-8 text-magit-success mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{t('listProperty.verifiedBuyersOnly')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('listProperty.verifiedBuyersDescription')}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <CheckCircle className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{t('listProperty.zeroCommission')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('listProperty.zeroCommissionDescription')}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <MapPin className="w-8 h-8 text-magit-warning mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{t('listProperty.premiumExposure')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('listProperty.premiumExposureDescription')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer isHalalMode={false} t={t} />
    </div>
  );
};

export default ListProperty;