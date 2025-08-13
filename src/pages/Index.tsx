import { useState, useEffect } from "react"
import { AuthenticatedHeader } from "@/components/AuthenticatedHeader"
import { AuthenticatedView } from "@/components/AuthenticatedView"
import { UnauthenticatedView } from "@/components/UnauthenticatedView"
import { Footer } from "@/components/Footer"
import { useTranslation } from "@/hooks/useTranslation"
import { useUser } from "@/contexts/UserContext"

const Index = () => {
  const [isHalalMode, setIsHalalMode] = useState(false)
  const { user, loading } = useUser()
  const { language, setLanguage, t } = useTranslation()

  // Initialize Halal mode from persisted preference (if any)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('isHalalMode')
      if (saved === 'true') setIsHalalMode(true)
      if (saved === 'false') setIsHalalMode(false)
    } catch {}
  }, [])

  // Apply global design changes based on Halal mode
  useEffect(() => {
    // Persist and expose globally
    try { localStorage.setItem('isHalalMode', String(isHalalMode)); } catch {}
    document.documentElement.setAttribute('data-halal-mode', String(isHalalMode));

    if (isHalalMode) {
      document.documentElement.style.setProperty('--primary', '176 64% 45%') // Trust-focused
      document.documentElement.style.setProperty('--accent', '176 44% 65%')
    } else {
      document.documentElement.style.setProperty('--primary', '25 85% 53%') // Original magit-warm
      document.documentElement.style.setProperty('--accent', '38 84% 60%')
    }
  }, [isHalalMode])


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isHalalMode ? 'bg-gradient-to-br from-magit-trust/5 to-primary/5' : 'bg-gradient-hero'
    }`}>
      
      {user ? (
        <>
          <AuthenticatedHeader 
            user={user}
            language={language}
            setLanguage={setLanguage}
            isHalalMode={isHalalMode}
          />
          <AuthenticatedView 
            user={user}
            isHalalMode={isHalalMode}
            setIsHalalMode={setIsHalalMode}
            t={t}
          />
          <Footer isHalalMode={isHalalMode} t={t} />
        </>
      ) : (
        <UnauthenticatedView 
          language={language}
          setLanguage={setLanguage}
          isHalalMode={isHalalMode}
          setIsHalalMode={setIsHalalMode}
          t={t}
        />
      )}
    </div>
  )
}

export default Index