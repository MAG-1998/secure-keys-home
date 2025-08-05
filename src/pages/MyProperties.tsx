import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { Eye, Calendar, MapPin, Bed, Bath, Square, Plus, Clock } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { MagitLogo } from "@/components/MagitLogo"
import { useToast } from "@/hooks/use-toast"

interface Property {
  id: string
  title: string
  description: string | null
  location: string
  price: number
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  image_url: string | null
  is_verified: boolean | null
  is_halal_financed: boolean | null
  visit_hours: any[] | null
  created_at: string
  views_count: number
  visit_requests_count: number
  upcoming_visits: any[]
  status?: string
}

const MyProperties = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    fetchProperties()
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return

      const { data, error } = await supabase
        .from('property_applications')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Add pending applications to properties list for display
      const pendingApplications = data?.filter(app => app.status === 'pending').map(app => ({
        id: app.id,
        title: `${app.property_type} - ${app.address}`,
        location: app.address,
        price: app.price,
        bedrooms: app.bedrooms,
        bathrooms: app.bathrooms,
        area: app.area,
        description: app.description,
        visit_hours: Array.isArray(app.visit_hours) ? app.visit_hours : [],
        status: 'pending',
        created_at: app.created_at,
        image_url: null,
        is_verified: false,
        is_halal_financed: false,
        views_count: 0,
        visit_requests_count: 0,
        upcoming_visits: []
      } as Property)) || []

      setProperties(prev => [...prev, ...pendingApplications])
    } catch (error) {
      console.error('Error fetching applications:', error)
    }
  }

  const fetchProperties = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/auth')
        return
      }

      // Fetch properties with analytics
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (propertiesError) throw propertiesError

      // Fetch view counts for each property
      const propertiesWithAnalytics = await Promise.all(
        (propertiesData || []).map(async (property) => {
          const { count: viewsCount } = await supabase
            .from('property_views')
            .select('*', { count: 'exact', head: true })
            .eq('property_id', property.id)

          const { count: visitRequestsCount } = await supabase
            .from('property_visits')
            .select('*', { count: 'exact', head: true })
            .eq('property_id', property.id)

          const { data: upcomingVisits } = await supabase
            .from('property_visits')
            .select(`
              *,
              profiles:visitor_id (full_name, email)
            `)
            .eq('property_id', property.id)
            .gte('visit_date', new Date().toISOString())
            .order('visit_date', { ascending: true })

          return {
            ...property,
            visit_hours: Array.isArray(property.visit_hours) ? property.visit_hours : [],
            views_count: viewsCount || 0,
            visit_requests_count: visitRequestsCount || 0,
            upcoming_visits: upcomingVisits || []
          }
        })
      )

      setProperties(propertiesWithAnalytics)
    } catch (error) {
      console.error('Error fetching properties:', error)
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <MagitLogo size="lg" />
          <p className="text-muted-foreground mt-4">Loading your properties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div onClick={() => navigate('/')} className="cursor-pointer">
                <MagitLogo size="md" />
              </div>
              <h1 className="font-heading font-bold text-xl text-foreground">My Properties</h1>
            </div>
            <Button onClick={() => navigate('/list-property')} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Property
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {properties.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="font-heading font-bold text-2xl text-foreground mb-4">No Properties Listed</h2>
            <p className="text-muted-foreground mb-8">Start by listing your first property</p>
            <Button onClick={() => navigate('/list-property')} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              List Your First Property
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="bg-background/80 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
                <div className="relative">
                  <img 
                    src={property.image_url || '/placeholder.svg'} 
                    alt={property.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-3 left-3">
                    {property.status === 'pending' && (
                      <Badge variant="secondary" className="mb-2">Under Review</Badge>
                    )}
                    {property.is_verified && (
                      <Badge variant="success" className="mb-2">Verified</Badge>
                    )}
                    {property.is_halal_financed && (
                      <Badge variant="outline" className="bg-magit-trust/10 text-magit-trust border-magit-trust">
                        Halal Financing
                      </Badge>
                    )}
                  </div>
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
                      {property.bedrooms}
                    </div>
                    <div className="flex items-center">
                      <Bath className="w-4 h-4 mr-1" />
                      {property.bathrooms}
                    </div>
                    <div className="flex items-center">
                      <Square className="w-4 h-4 mr-1" />
                      {property.area}m²
                    </div>
                  </div>

                  <Tabs defaultValue="analytics" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                      <TabsTrigger value="visits">Visits</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="analytics" className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-center mb-1">
                            <Eye className="w-4 h-4 mr-1" />
                          </div>
                          <div className="font-bold text-lg">{property.views_count}</div>
                          <div className="text-xs text-muted-foreground">Views</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-center mb-1">
                            <Calendar className="w-4 h-4 mr-1" />
                          </div>
                          <div className="font-bold text-lg">{property.visit_requests_count}</div>
                          <div className="text-xs text-muted-foreground">Visit Requests</div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="visits" className="space-y-3">
                      {property.upcoming_visits.length === 0 ? (
                        <p className="text-center text-muted-foreground text-sm py-4">No upcoming visits</p>
                      ) : (
                        <div className="space-y-2">
                          {property.upcoming_visits.slice(0, 2).map((visit) => (
                            <div key={visit.id} className="p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-sm">{visit.profiles?.full_name || visit.profiles?.email}</div>
                                  <div className="text-xs text-muted-foreground flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {formatDate(visit.visit_date)}
                                  </div>
                                </div>
                                <Badge variant={visit.status === 'confirmed' ? 'success' : 'outline'} className="text-xs">
                                  {visit.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                          {property.upcoming_visits.length > 2 && (
                            <p className="text-center text-xs text-muted-foreground">
                              +{property.upcoming_visits.length - 2} more visits
                            </p>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => navigate(`/property/${property.id}/manage`)}
                  >
                    Manage Property
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ThemeToggle />
    </div>
  )
}

export default MyProperties