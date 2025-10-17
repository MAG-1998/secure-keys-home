import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Calendar as CalendarIcon,
  Building2,
  FileCheck,
  ExternalLink
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
    account_type: "individual"
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
          account_type: profileData.account_type || "individual"
        })
      }
    }

    getProfile()
  }, [navigate])

  const getCompanyPublicUrl = (path?: string | null) => {
    const base = 'https://mvndmnkgtoygsvesktgw.supabase.co';
    if (!path) return '';
    const p = String(path);
    if (p.startsWith('http://') || p.startsWith('https://')) return p;
    if (p.startsWith('/storage/v1/object/public/')) return `${base}${p}`;
    if (p.startsWith('storage/v1/object/public/')) return `${base}/${p}`;
    if (p.startsWith('/company-documents/')) return `${base}/storage/v1/object/public${p}`;
    if (p.startsWith('company-documents/')) return `${base}/storage/v1/object/public/${p}`;
    const clean = p.startsWith('/') ? p.slice(1) : p;
    return `${base}/storage/v1/object/public/company-documents/${clean}`;
  }

  const handleSave = async () => {
    setLoading(true)
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        account_type: formData.account_type
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
      account_type: profile?.account_type || "individual"
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
                {t('profile.backToDashboard')}
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
                    {profile?.account_type === 'legal_entity' && profile?.company_logo_url ? (
                      <AvatarImage 
                        src={getCompanyPublicUrl(profile.company_logo_url)} 
                        alt={profile.company_name || 'Company logo'} 
                      />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {profile?.account_type === 'legal_entity' && profile?.company_name 
                        ? profile.company_name.charAt(0).toUpperCase()
                        : user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-heading font-bold">
                      {profile?.account_type === 'legal_entity' && profile?.company_name 
                        ? profile.company_name 
                        : profile?.full_name || t('profile.title')}
                    </h1>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={profile?.account_type === 'legal_entity' ? 'default' : 'secondary'}>
                        {profile?.account_type === 'legal_entity' ? t('auth.accountTypeLegalEntity') : t('auth.accountTypeIndividual')}
                      </Badge>
                      {profile?.verification_status === 'pending' && (
                        <Badge variant="warning">
                          {t('profile.verificationPending')}
                        </Badge>
                      )}
                      {profile?.verification_status === 'approved' && profile?.is_verified && (
                        <Badge variant="success" className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {t('profile.verified')}
                        </Badge>
                      )}
                      {profile?.verification_status === 'rejected' && (
                        <Badge variant="destructive">
                          {t('profile.verificationRejected')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    {t('profile.editProfile')}
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      {t('profile.saveChanges')}
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
                {t('profile.personalInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">{t('profile.fullName')}</Label>
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
                  <Label htmlFor="email">{t('profile.email')}</Label>
                  <div className="flex items-center space-x-2 p-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone">{t('profile.phoneNumber')}</Label>
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
                  <Label htmlFor="account_type">{t('profile.accountType')}</Label>
                  {isEditing ? (
                    <select
                      id="account_type"
                      value={formData.account_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, account_type: e.target.value }))}
                      className="w-full p-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="individual">{t('auth.accountTypeIndividual')}</option>
                      <option value="legal_entity">{t('auth.accountTypeLegalEntity')}</option>
                    </select>
                  ) : (
                    <div className="p-2 text-sm">
                      {profile?.account_type === 'legal_entity' ? t('auth.accountTypeLegalEntity') : t('auth.accountTypeIndividual')}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information - Only for Legal Entities */}
          {profile?.account_type === 'legal_entity' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {t('profile.companyInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{t('auth.companyName')}</Label>
                    <div className="p-2 text-sm font-medium">{profile?.company_name || 'Not provided'}</div>
                  </div>
                  
                  <div>
                    <Label>{t('auth.registrationNumber')}</Label>
                    <div className="p-2 text-sm">{profile?.registration_number || 'Not provided'}</div>
                  </div>
                  
                  <div>
                    <Label>{t('auth.contactPerson')}</Label>
                    <div className="p-2 text-sm">{profile?.contact_person_name || 'Not provided'}</div>
                  </div>
                  
                  {profile?.number_of_properties !== null && (
                    <div>
                      <Label>{t('auth.numberOfProperties')}</Label>
                      <div className="p-2 text-sm">{profile.number_of_properties}</div>
                    </div>
                  )}
                  
                  <div className="md:col-span-2">
                    <Label>{t('auth.companyDescription')}</Label>
                    <div className="p-2 text-sm text-muted-foreground">
                      {profile?.company_description || 'No description provided'}
                    </div>
                  </div>
                  
                  {profile?.company_license_url && (
                    <div>
                      <Label>{t('auth.companyLicense')}</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getCompanyPublicUrl(profile.company_license_url), '_blank')}
                        className="mt-2"
                      >
                        <FileCheck className="w-4 h-4 mr-2" />
                        View License
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    </div>
                  )}
                  
                  {profile?.company_logo_url && (
                    <div>
                      <Label>{t('auth.companyLogo')}</Label>
                      <div className="mt-2">
                        <img
                          src={getCompanyPublicUrl(profile.company_logo_url)}
                          alt="Company logo"
                          className="w-24 h-24 object-contain border rounded-lg p-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ID Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t('profile.identityVerification')}
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
                      {t('profile.verificationPrompt')}
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
                {t('profile.visitLimitsPlan')}
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
                      <span className="text-sm font-medium">{t('profile.thisWeekVisits')}</span>
                      <Badge variant={freeVisitsUsed >= 5 ? "destructive" : "secondary"}>
                        {freeVisitsUsed}/5 {t('profile.visitsUsed')}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{t('profile.freeVisitsLeft')}</span>
                      <Badge variant={freeVisitsUsed === 0 ? "success" : "outline"}>
                        {freeVisitsUsed === 0 ? t('profile.oneFreeVisit') : t('profile.noFreeVisits')}
                      </Badge>
                    </div>

                    {isRestricted && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {t('profile.visitRestricted')}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">{t('profile.currentPlan')}</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• {t('profile.planFeature1')}</p>
                      <p>• {t('profile.planFeature2')}</p>
                      <p>• {t('profile.planFeature3')}</p>
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full">
                      {t('profile.upgradePlan')}
                    </Button>
                    
                    <div className="text-xs text-muted-foreground">
                      {t('profile.premiumFeatures')}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.accountSettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{t('profile.emailNotifications')}</h4>
                  <p className="text-sm text-muted-foreground">{t('profile.emailNotificationsDesc')}</p>
                </div>
                <Button variant="outline" size="sm">
                  {t('profile.manage')}
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{t('profile.privacySettings')}</h4>
                  <p className="text-sm text-muted-foreground">{t('profile.privacySettingsDesc')}</p>
                </div>
                <Button variant="outline" size="sm">
                  {t('profile.manage')}
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