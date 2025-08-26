import { lazy, Suspense, memo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import type { Language } from "@/hooks/useTranslation"

// Use the Yandex Maps implementation with filtering
const YandexMap = lazy(() => import('./YandexMap'))

const MapLoadingFallback = memo(() => (
  <Card>
    <CardContent className="p-6">
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-48 mb-4"></div>
        <div className="h-64 bg-muted rounded-lg mb-4"></div>
        <div className="flex space-x-2">
          <div className="h-6 bg-muted rounded w-20"></div>
          <div className="h-6 bg-muted rounded w-24"></div>
          <div className="h-6 bg-muted rounded w-16"></div>
        </div>
      </div>
    </CardContent>
  </Card>
))

MapLoadingFallback.displayName = "MapLoadingFallback"

interface LazyMapSectionProps {
  t: (key: string) => string
  isHalalMode?: boolean
  language: Language
  searchResults?: any[]
  onSearchResultsChange?: (results: any[]) => void
}

const LazyMapSection = memo(({ t, isHalalMode, language, searchResults, onSearchResultsChange }: LazyMapSectionProps) => {
  return (
    <Suspense fallback={<MapLoadingFallback />}>
      <YandexMap 
        t={t} 
        isHalalMode={isHalalMode} 
        language={language}
        searchResults={searchResults}
        onSearchResultsChange={onSearchResultsChange}
      />
    </Suspense>
  )
})

LazyMapSection.displayName = "LazyMapSection"

export default LazyMapSection