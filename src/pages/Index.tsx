import { AuthenticatedHeader } from "@/components/AuthenticatedHeader"
import { AuthenticatedView } from "@/components/AuthenticatedView"
import { UnauthenticatedView } from "@/components/UnauthenticatedView"
import { Footer } from "@/components/Footer"
import { useTranslation } from "@/hooks/useTranslation"
import { useUser } from "@/contexts/UserContext"
import { useGlobalHalalMode } from "@/hooks/useGlobalHalalMode"

const Index = () => {
  const { user, loading } = useUser()
  const { language, setLanguage, t } = useTranslation()
  const { isHalalMode } = useGlobalHalalMode()


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
            t={t}
          />
          <Footer isHalalMode={isHalalMode} t={t} />
        </>
      ) : (
        <UnauthenticatedView 
          language={language}
          setLanguage={setLanguage}
          t={t}
        />
      )}
    </div>
  )
}

export default Index