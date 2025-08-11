import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MagitLogo } from "@/components/MagitLogo"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/useTranslation"
import type { User } from "@supabase/supabase-js"

const Auth = () => {
  const [isLogin, setIsLogin] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search)
    return !urlParams.has('signup')
  })
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showResetOption, setShowResetOption] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useTranslation()
  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Simple redirect to dashboard for existing sessions
        navigate("/dashboard")
      }
    }
    checkSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === 'SIGNED_IN') {
        // Simple redirect to dashboard on sign in
        navigate("/dashboard")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignUp = async () => {
    if (!email || !password || !fullName || !phone) {
      setError(t('auth.fillAllFields'))
      return
    }

    setLoading(true)
    setError("")

    // Block sign up if email/phone is banned
    try {
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
    } catch {}

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: fullName,
          phone: phone
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
    } else {
      toast({
        title: t('auth.accountCreatedTitle'),
        description: t('auth.accountCreatedDesc'),
      })
      setShowResetOption(false)
      setIsLogin(true)
    }
    setLoading(false)
  }

  const handleSignIn = async () => {
    if (!email || !password) {
      setError(t('auth.fillAllFields'))
      return
    }

    setLoading(true)
    setError("")

    // Check red list before sign in
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
    } else {
      // Redirect will be handled by auth state change listener
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
          {/* Back to home button */}
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
                {isLogin ? t('auth.titleLogin') : t('auth.titleSignup')}
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
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t('auth.fullNamePlaceholder')}
                        required={!isLogin}
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
                          required={!isLogin}
                        />
                      </div>
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

                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin)
                      setError("")
                      setFullName("")
                      setPhone("")
                    }}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    {isLogin 
                      ? t('auth.toggleToSignup')
                      : t('auth.toggleToLogin')
                    }
                  </button>
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