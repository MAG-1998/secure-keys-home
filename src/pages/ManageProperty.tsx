import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MagitLogo } from '@/components/MagitLogo'
import { Footer } from '@/components/Footer'
import { useTranslation } from '@/hooks/useTranslation'

interface PropertyRow {
  id: string
  title: string
  description: string | null
  location: string
  price: number
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  image_url: string | null
  status?: string | null
  created_at: string
}

const ManageProperty = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [property, setProperty] = useState<PropertyRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          navigate('/auth')
          return
        }
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single()
        if (error) throw error
        setProperty(data as unknown as PropertyRow)
      } catch (e) {
        console.error('Failed to load property', e)
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <MagitLogo size="lg" isLoading={true} />
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mx-auto mt-4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="w-[480px]">
          <CardHeader>
            <CardTitle>Property not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/my-properties')}>Back to My Properties</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div onClick={() => navigate('/')} className="cursor-pointer">
                <MagitLogo size="md" />
              </div>
              <h1 className="font-heading font-bold text-xl text-foreground">Manage Property</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/my-properties')}>Back</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="relative">
            <img
              src={property.image_url || '/placeholder.svg'}
              alt={property.title}
              className="w-full h-64 object-cover rounded-t-lg"
            />
            <div className="absolute top-3 left-3 space-y-2">
              {property.status && (
                <Badge variant={property.status === 'approved' || property.status === 'active' ? 'success' : 'destructive'}>
                  {property.status}
                </Badge>
              )}
            </div>
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-2xl">{property.title}</h2>
              <div className="text-2xl font-bold text-primary">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(property.price)}
              </div>
            </div>
            <div className="text-muted-foreground">{property.location}</div>
            <div className="prose dark:prose-invert max-w-none">
              {property.description || 'No description provided.'}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="default" onClick={() => navigate('/my-properties')}>Done</Button>
              <Button variant="secondary" onClick={() => alert('Edit coming soon')}>Edit Details</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer t={t} />
    </div>
  )
}

export default ManageProperty
