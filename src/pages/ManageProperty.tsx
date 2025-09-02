import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MagitLogo } from '@/components/MagitLogo'
import { Footer } from '@/components/Footer'
import { useTranslation } from '@/hooks/useTranslation'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

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
  photos?: string[] | null
  status?: string | null
  created_at: string
}

const ManageProperty = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { toast } = useToast()
  const [property, setProperty] = useState<PropertyRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [description, setDescription] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

useEffect(() => {
  const load = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/auth')
        return
      }
      setUserId(user.id)
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      if (data) {
        setProperty(data as unknown as PropertyRow)
        setPhotos(Array.isArray((data as any).photos) ? ((data as any).photos as string[]).filter(Boolean) : [])
        setDescription((data as any).description ?? '')
      } else {
        setProperty(null)
      }
    } catch (e) {
      console.error('Failed to load property', e)
    } finally {
      setLoading(false)
    }
  }
  if (id) load()
}, [id, navigate])

const movePhoto = (index: number, direction: 'up' | 'down') => {
  setPhotos(prev => {
    const newArr = [...prev]
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= newArr.length) return prev
    ;[newArr[index], newArr[target]] = [newArr[target], newArr[index]]
    return newArr
  })
}

const removePhoto = (index: number) => {
  setPhotos(prev => {
    if (prev.length <= 5) {
      toast({
        variant: 'destructive',
        title: 'Minimum 5 photos required',
        description: 'Please keep at least 5 photos for your listing.',
      })
      return prev
    }
    const newArr = [...prev]
    newArr.splice(index, 1)
    return newArr
  })
}

const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files
  if (!files || !userId || !id) return
  setUploading(true)
  try {
    const urls = await Promise.all(
      Array.from(files).map(async (file, idx) => {
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${userId}/properties/${id}/${Date.now()}-${idx}.${ext}`
        const { error: uploadError } = await supabase.storage.from('properties').upload(path, file, { upsert: false })
        if (uploadError) throw uploadError
        const { data: publicData } = supabase.storage.from('properties').getPublicUrl(path)
        return publicData.publicUrl
      })
    )
    setPhotos(prev => [...prev, ...urls])
    toast({ title: 'Photos added', description: `${urls.length} photo(s) uploaded.` })
  } catch (err) {
    console.error('Upload failed', err)
    toast({ variant: 'destructive', title: 'Upload failed', description: 'Please try again.' })
  } finally {
    setUploading(false)
    e.currentTarget.value = ''
  }
}

const handleSave = async () => {
  if (!id || !property) return
  if (photos.length < 5) {
    toast({
      variant: 'destructive',
      title: 'Add more photos',
      description: 'Minimum 5 photos are required before saving.',
    })
    return
  }
  setSaving(true)
  try {
    const payload: Partial<PropertyRow> & { photos: string[]; description: string; image_url: string | null } = {
      photos,
      description,
      image_url: photos[0] || property.image_url || null,
    }
    const { error } = await supabase.from('properties').update(payload).eq('id', id)
    if (error) throw error
    setProperty(prev => prev ? { ...prev, description, image_url: payload.image_url, photos } : prev)
    setEditing(false)
    toast({ title: 'Saved', description: 'Your changes have been saved.' })
  } catch (err) {
    console.error('Save failed', err)
    toast({ variant: 'destructive', title: 'Save failed', description: 'Please try again.' })
  } finally {
    setSaving(false)
  }
}

const handleCancel = () => {
  setEditing(false)
  setPhotos((property as any)?.photos ?? [])
  setDescription(property?.description ?? '')
}

const handleDeleteProperty = async () => {
  if (!id) return
  setSaving(true)
  try {
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (error) throw error
    toast({ title: 'Property deleted' })
    navigate('/my-properties')
  } catch (err) {
    console.error('Delete failed', err)
    toast({ variant: 'destructive', title: 'Delete failed', description: 'Please try again.' })
  } finally {
    setSaving(false)
  }
}

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
{editing ? (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-2">Description</label>
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe your property..."
      />
    </div>

    <section>
      <h3 className="text-lg font-semibold mb-2">Photos</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((url, idx) => (
          <div key={url + idx} className="relative group border rounded-md overflow-hidden">
            <img 
              src={url} 
              alt={`Property photo ${idx + 1}`} 
              className="w-full h-32 object-cover" 
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg'
              }}
            />
            <div className="absolute inset-x-0 bottom-0 p-2 bg-background/70 backdrop-blur-sm flex items-center justify-between">
              <div className="space-x-2">
                <Button size="sm" variant="outline" onClick={() => movePhoto(idx, 'up')} disabled={idx === 0}>
                  Up
                </Button>
                <Button size="sm" variant="outline" onClick={() => movePhoto(idx, 'down')} disabled={idx === photos.length - 1}>
                  Down
                </Button>
              </div>
              <Button size="sm" variant="destructive" onClick={() => removePhoto(idx)}>
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesSelected}
          disabled={uploading}
        />
        <span className="text-sm text-muted-foreground">Minimum 5 photos required</span>
      </div>
    </section>
  </div>
) : (
  <div className="prose dark:prose-invert max-w-none">
    {property.description || 'No description provided.'}
  </div>
)}


<div className="flex flex-wrap gap-3 pt-4">
  {!editing ? (
    <>
      <Button variant="default" onClick={() => navigate('/my-properties')}>Done</Button>
      <Button variant="secondary" onClick={() => setEditing(true)}>Edit Details</Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete Property</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this property?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProperty}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  ) : (
    <>
      <Button variant="default" onClick={handleSave} disabled={saving || photos.length < 5}>
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
      <Button variant="outline" onClick={handleCancel} disabled={saving || uploading}>Cancel</Button>
    </>
  )}
</div>

          </CardContent>
        </Card>
      </div>

      <Footer t={t} />
    </div>
  )
}

export default ManageProperty
