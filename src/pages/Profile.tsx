import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MagitLogo } from "@/components/MagitLogo"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Edit2,
  Save,
  X,
  Calendar as CalendarIcon
} from "lucide-react"
import { Footer } from "@/components/Footer"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/useTranslation"
import { useVisitLimits } from "@/hooks/useVisitLimits"

const Profile = () => {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    user_type: "buyer"
  })
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useTranslation()
  const { freeVisitsUsed, canCreate, isRestricted, loading: limitsLoading } = useVisitLimits()

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/auth')
        return
      }

      setUser(session.user)

      // Get profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setFormData({
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
          user_type: profileData.user_type || "buyer"
        })
      }
    }

    getProfile()
  }, [navigate])

  const handleSave = async () => {
    setLoading(true)
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        user_type: formData.user_type
      })
      .eq('user_id', user.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully"
      })
      setIsEditing(false)
      // Refresh profile data
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
    }
    
    setLoading(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      user_type: profile?.user_type || "buyer"
    })
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <MagitLogo size="md" />
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-heading font-bold">
                      {profile?.full_name || 'Your Profile'}
                    </h1>
                    <p className="text-muted-foreground">{user.email}</p>
                    <Badge variant={profile?.user_type === 'seller' ? 'default' : 'secondary'} className="mt-1">
                      {profile?.user_type || 'buyer'}
                    </Badge>
                  </div>
                </div>
                
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="p-2 text-sm">{profile?.full_name || 'Not provided'}</div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center space-x-2 p-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
                        +998
                      </span>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="90 123 45 67"
                        className="pl-16"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 p-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {profile?.phone ? `+998 ${profile.phone}` : 'Not provided'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="user_type">Account Type</Label>
                  {isEditing ? (
                    <select
                      id="user_type"
                      value={formData.user_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, user_type: e.target.value }))}
                      className="w-full p-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                    </select>
                  ) : (
                    <div className="p-2 text-sm capitalize">{profile?.user_type || 'buyer'}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ID Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Identity Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Identity verification is required to list properties and make offers. This helps maintain our 95% trust rating.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Government ID</h4>
                      <p className="text-sm text-muted-foreground">Upload your passport or ID card</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload ID
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Selfie Verification</h4>
                      <p className="text-sm text-muted-foreground">Take a selfie holding your ID</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Take Selfie
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-yellow-900 dark:text-yellow-100">
                      Verification Status: Pending
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-200 mt-1">
                      Complete identity verification to unlock all features and build trust with other users.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visit Limits & Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Visit Limits & Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {limitsLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">This Week's Visits</span>
                      <Badge variant={freeVisitsUsed >= 5 ? "destructive" : "secondary"}>
                        {freeVisitsUsed}/5 used
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Free Visits Left</span>
                      <Badge variant={freeVisitsUsed === 0 ? "success" : "outline"}>
                        {freeVisitsUsed === 0 ? "1 free visit" : "0 free visits"}
                      </Badge>
                    </div>

                    {isRestricted && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Your visit requests are currently restricted. Contact support for assistance.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Current Plan: Free</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• 1 free visit request per week</p>
                      <p>• Up to 5 paid visits per week</p>
                      <p>• Basic property search</p>
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full">
                      Upgrade to Premium
                    </Button>
                    
                    <div className="text-xs text-muted-foreground">
                      Premium: Unlimited visits • Priority support • Advanced filters
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive updates about your listings and messages</p>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">Privacy Settings</h4>
                  <p className="text-sm text-muted-foreground">Control who can see your profile information</p>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-red-600">Delete Account</h4>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer t={t} />
    </div>
  )
}

export default Profile