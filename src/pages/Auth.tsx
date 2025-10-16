import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { MagitLogo } from "@/components/MagitLogo"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, ArrowLeft, Upload, Building2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/useTranslation"
import type { User } from "@supabase/supabase-js"

const Auth = () => {
  const [isLogin, setIsLogin] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search)
    return !urlParams.has('signup')
  })
  const [isLegalEntity, setIsLegalEntity] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showResetOption, setShowResetOption] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  
  // Company-specific fields
  const [companyData, setCompanyData] = useState({
    companyName: "",
    registrationNumber: "",
    contactPersonName: "",
    companyDescription: "",
    numberOfProperties: ""
  })
  const [companyLicense, setCompanyLicense] = useState<File | null>(null)
  const [companyLogo, setCompanyLogo] = useState<File | null>(null)
  
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useTranslation()
  
  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        navigate(redirect || "/");
      }
    }
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === 'SIGNED_IN') {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        navigate(redirect || "/");
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const uploadFile = async (file: File, bucket: string, folder: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${Math.random()}.${fileExt}`
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)
    
    if (error) throw error
    return data.path
  }

  const handleSignUp = async () => {
    if (isLegalEntity) {
      if (!email || !password || !companyData.companyName || !companyData.registrationNumber || 
          !companyData.contactPersonName || !companyLicense) {
        setError(t('auth.fillAllFields'))
        return
      }
    } else {
      if (!email || !password || !fullName || !phone) {
        setError(t('auth.fillAllFields'))
        return
      }
    }

    setLoading(true)
    setError("")

    try {
      // Block sign up if email/phone is banned
      const { data: banned } = await supabase
        .from('red_list')
        .select('id, reason')
        .or(`lower(email).eq.${email.toLowerCase()},phone.eq.${phone}`)
        .maybeSingle();
      if (banned) {
        setError(`Your account cannot be created: ${banned.reason || 'Banned'}`)
        setLoading(false)
        return
      }

      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: isLegalEntity ? {
            full_name: companyData.companyName,
            account_type: 'legal_entity'
          } : {
            full_name: fullName,
            phone: phone,
            account_type: 'individual'
          }
        }
      })

      if (signUpError) {
        const msg = (signUpError as any)?.message || ''
        if (/already\s*registered|already\s*exists/i.test(msg)) {
          setError(t('auth.userExists'))
          setShowResetOption(true)
        } else {
          setError(msg)
        }
        setLoading(false)
        return
      }

      // If legal entity, upload documents and update profile
      if (isLegalEntity && authData.user) {
        const userId = authData.user.id
        
        // Upload company license
        const licensePath = await uploadFile(companyLicense!, 'company-documents', userId)
        
        // Upload company logo if provided
        let logoPath = null
        if (companyLogo) {
          logoPath = await uploadFile(companyLogo, 'company-documents', userId)
        }

        // Update profile with company data
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            company_name: companyData.companyName,
            registration_number: companyData.registrationNumber,
            company_license_url: `/storage/v1/object/public/company-documents/${licensePath}`,
            company_logo_url: logoPath ? `/storage/v1/object/public/company-documents/${logoPath}` : null,
            contact_person_name: companyData.contactPersonName,
            company_description: companyData.companyDescription || null,
            number_of_properties: companyData.numberOfProperties ? parseInt(companyData.numberOfProperties) : null,
            verification_status: 'pending',
            phone: phone
          })
          .eq('user_id', userId)

        if (profileError) {
          console.error('Profile update error:', profileError)
        }
      }

      toast({
        title: t('auth.accountCreatedTitle'),
        description: isLegalEntity 
          ? 'Your company account has been created and is pending verification.'
          : t('auth.accountCreatedDesc'),
      })
      setShowResetOption(false)
      setIsLogin(true)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async () => {
    if (!email || !password) {
      setError(t('auth.fillAllFields'))
      return
    }

    setLoading(true)
    setError("")

    try {
      const { data: banned } = await supabase
        .from('red_list')
        .select('id, reason')
        .eq('email', email)
        .maybeSingle();
      if (banned) {
        setError(`Sign in blocked: ${banned.reason || 'Banned'}`)
        setLoading(false)
        return
      }
    } catch {}

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      setError(signInError.message)
    }
    setLoading(false)
  }

  const handleResetPassword = async () => {
    if (!email) return
    try {
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`
      })
      if (error) throw error
      toast({ title: t('common.passwordResetSent'), description: t('common.checkEmailReset') })
    } catch (e: any) {
      setError(e.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLogin) {
      handleSignIn()
    } else {
      handleSignUp()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.backToHome')}
          </Button>

          <Card className="shadow-warm border-0">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <MagitLogo size="lg" />
              </div>
              <CardTitle className="text-2xl font-heading">
                {isLogin ? t('auth.titleLogin') : (isLegalEntity ? t('auth.accountTypeLegalEntity') + ' ' + t('auth.titleSignup') : t('auth.titleSignup'))}
              </CardTitle>
              <p className="text-muted-foreground">
                {isLogin 
                  ? t('auth.subtitleLogin') 
                  : t('auth.subtitleSignup')
                }
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && !isLegalEntity && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t('auth.fullNamePlaceholder')}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('auth.phoneNumber')}</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
                          +998
                        </span>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={t('auth.phonePlaceholder')}
                          className="pl-16"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {!isLogin && isLegalEntity && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">{t('auth.companyName')}</Label>
                      <Input
                        id="companyName"
                        type="text"
                        value={companyData.companyName}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, companyName: e.target.value }))}
                        placeholder="Company LLC"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">{t('auth.registrationNumber')}</Label>
                      <Input
                        id="registrationNumber"
                        type="text"
                        value={companyData.registrationNumber}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                        placeholder="123456789"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPersonName">{t('auth.contactPersonName')}</Label>
                      <Input
                        id="contactPersonName"
                        type="text"
                        value={companyData.contactPersonName}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, contactPersonName: e.target.value }))}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('auth.phoneNumber')}</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
                          +998
                        </span>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={t('auth.phonePlaceholder')}
                          className="pl-16"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyLicense">{t('auth.companyLicense')}</Label>
                      <Input
                        id="companyLicense"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setCompanyLicense(e.target.files?.[0] || null)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyLogo">{t('auth.companyLogo')}</Label>
                      <Input
                        id="companyLogo"
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => setCompanyLogo(e.target.files?.[0] || null)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyDescription">{t('auth.companyDescription')}</Label>
                      <Textarea
                        id="companyDescription"
                        value={companyData.companyDescription}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, companyDescription: e.target.value }))}
                        placeholder="Brief company description..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numberOfProperties">{t('auth.numberOfProperties')}</Label>
                      <Input
                        id="numberOfProperties"
                        type="number"
                        value={companyData.numberOfProperties}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, numberOfProperties: e.target.value }))}
                        placeholder="10"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.passwordPlaceholder')}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="space-y-2">
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <div className="flex flex-wrap gap-2">
                      {showResetOption && (
                        <Button type="button" variant="secondary" onClick={handleResetPassword} disabled={loading}>
                          {t('auth.resetPassword')}
                        </Button>
                      )}
                      <Button type="button" variant="outline" onClick={() => window.open('mailto:support@magit.app?subject=Ban%20Appeal','_blank')}>
                        {t('common.contactSupport')}
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading 
                    ? t('auth.loading')
                    : isLogin 
                      ? t('auth.signIn')
                      : t('auth.signUp')
                  }
                </Button>

                <div className="text-center pt-4 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin)
                      setError("")
                      setFullName("")
                      setPhone("")
                      setIsLegalEntity(false)
                    }}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    {isLogin 
                      ? t('auth.toggleToSignup')
                      : t('auth.toggleToLogin')
                    }
                  </button>

                  {!isLogin && (
                    <div className="text-sm text-muted-foreground">
                      {t('auth.registerAsCompany')}{' '}
                      <button
                        type="button"
                        onClick={() => setIsLegalEntity(!isLegalEntity)}
                        className="text-primary hover:text-primary/80 transition-colors font-medium inline-flex items-center gap-1"
                      >
                        <Building2 className="w-3 h-3" />
                        {t('auth.signUpAsLegalEntity')}
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer t={t} />
    </div>
  )
}

export default Auth