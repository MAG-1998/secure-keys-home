import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { Heart, MapPin, Bed, Bath, Square, Calendar, Clock, CreditCard } from "lucide-react"
import { Footer } from "@/components/Footer"
import { MagitLogo } from "@/components/MagitLogo"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/useTranslation"

interface SavedProperty {
  id: string
  property_id: string
  saved_at: string
  properties: {
    id: string
    title: string
    location: string
    price: number
    bedrooms: number | null
    bathrooms: number | null
    area: number | null
    image_url: string | null
    is_verified: boolean | null
    is_halal_financed: boolean | null
    visit_hours: any[] | null
    user_id: string
    profiles: {
      full_name: string | null
      email: string
    }
  }
}

const SavedProperties = () => {
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<SavedProperty | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [customTime, setCustomTime] = useState("")
  const [notes, setNotes] = useState("")
  const [needsDeposit, setNeedsDeposit] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useTranslation()

  useEffect(() => {
    fetchSavedProperties()
  }, [])

  const fetchSavedProperties = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/auth')
        return
      }

      const { data, error } = await supabase
        .from('saved_properties')
        .select(`
          *,
          properties (
            *,
            profiles:user_id (full_name, email)
          )
        `)
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false })

      if (error) throw error
      
      const processedData = (data || []).map(item => ({
        ...item,
        properties: {
          ...item.properties,
          visit_hours: Array.isArray(item.properties.visit_hours) ? item.properties.visit_hours : []
        }
      }))
      
      setSavedProperties(processedData)
    } catch (error) {
      console.error('Error fetching saved properties:', error)
      toast({
        title: "Error",
        description: "Failed to load saved properties",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const removeSavedProperty = async (savedPropertyId: string) => {
    try {
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('id', savedPropertyId)

      if (error) throw error

      setSavedProperties(prev => prev.filter(p => p.id !== savedPropertyId))
      toast({
        title: "Success",
        description: "Property removed from saved list"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove property",
        variant: "destructive"
      })
    }
  }

  const requestVisit = async () => {
    if (!selectedProperty || !selectedDate) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const isCustomTimeSlot = customTime && !selectedProperty.properties.visit_hours?.includes(customTime)
      
      const { error } = await supabase
        .from('property_visits')
        .insert({
          property_id: selectedProperty.property_id,
          visitor_id: user.id,
          visit_date: new Date(`${selectedDate}T${customTime || selectedProperty.properties.visit_hours?.[0] || '10:00'}`).toISOString(),
          is_custom_time: isCustomTimeSlot,
          deposit_paid: isCustomTimeSlot ? needsDeposit : false,
          notes: notes || null
        })

      if (error) throw error

      toast({
        title: "Success",
        description: isCustomTimeSlot && !needsDeposit 
          ? "Visit request sent! Please pay the deposit to confirm your custom time slot."
          : "Visit request sent successfully!"
      })

      setSelectedProperty(null)
      setSelectedDate("")
      setCustomTime("")
      setNotes("")
      setNeedsDeposit(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request visit",
        variant: "destructive"
      })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <MagitLogo size="lg" />
          <p className="text-muted-foreground mt-4">Loading saved properties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div onClick={() => navigate('/')} className="cursor-pointer">
                <MagitLogo size="md" />
              </div>
              <h1 className="font-heading font-bold text-xl text-foreground">Saved Properties</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/my-requests')}>
                My Requests
              </Button>
              <Button variant="outline" onClick={() => navigate('/properties')}>
                Browse More
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8">
        {savedProperties.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="font-heading font-bold text-2xl text-foreground mb-4">No Saved Properties</h2>
            <p className="text-muted-foreground mb-8">Start exploring and save properties you're interested in</p>
            <Button onClick={() => navigate('/')} size="lg">
              Browse Properties
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {savedProperties.map((savedProperty) => {
              const property = savedProperty.properties
              return (
                <Card key={savedProperty.id} className="bg-background/80 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <img 
                      src={property.image_url || '/placeholder.svg'} 
                      alt={property.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-3 left-3">
                      {property.is_verified && (
                        <Badge variant="success" className="mb-2">Verified</Badge>
                      )}
                      {property.is_halal_financed && (
                        <Badge variant="outline" className="bg-magit-trust/10 text-magit-trust border-magit-trust">
                          Halal Financing
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-3 right-3 text-red-500 hover:text-red-600"
                      onClick={() => removeSavedProperty(savedProperty.id)}
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </Button>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="font-heading font-bold text-lg text-foreground mb-2">{property.title}</h3>
                    <div className="flex items-center text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                    
                    <div className="text-2xl font-bold text-primary mb-4">
                      {formatPrice(property.price)}
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 mr-1" />
                        {property.bedrooms || 0}
                      </div>
                      <div className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        {property.bathrooms || 0}
                      </div>
                      <div className="flex items-center">
                        <Square className="w-4 h-4 mr-1" />
                        {property.area || 0}m²
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">
                        Listed by: {property.profiles?.full_name || property.profiles?.email}
                      </p>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full"
                          onClick={() => setSelectedProperty(savedProperty)}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Request Visit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Request Property Visit</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Select Date</label>
                            <input
                              type="date"
                              value={selectedDate}
                              onChange={(e) => setSelectedDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full mt-1 p-2 border border-input rounded-md bg-background"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium">Available Time Slots</label>
                            <Select onValueChange={setCustomTime}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time slot" />
                              </SelectTrigger>
                              <SelectContent>
                                {property.visit_hours?.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                                <SelectItem value="custom">Request Custom Time</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {customTime === 'custom' && (
                            <div>
                              <label className="text-sm font-medium">Custom Time</label>
                              <input
                                type="time"
                                onChange={(e) => setCustomTime(e.target.value)}
                                className="w-full mt-1 p-2 border border-input rounded-md bg-background"
                              />
                              <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                                <div className="flex items-center text-orange-700 dark:text-orange-300">
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  <span className="text-sm font-medium">Deposit Required: 200,000 SUM</span>
                                </div>
                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                  Custom time slots require a deposit to prevent unnecessary disturbance to the property owner.
                                </p>
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="text-sm font-medium">Additional Notes (Optional)</label>
                            <Textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Any specific requirements or questions..."
                              className="mt-1"
                            />
                          </div>

                          <Button 
                            onClick={requestVisit} 
                            className="w-full"
                            disabled={!selectedDate || !customTime}
                          >
                            {customTime === 'custom' && !needsDeposit ? (
                              <>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Request & Pay Deposit
                              </>
                            ) : (
                              <>
                                <Calendar className="w-4 h-4 mr-2" />
                                Send Request
                              </>
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Footer t={t} />
    </div>
  )
}

export default SavedProperties