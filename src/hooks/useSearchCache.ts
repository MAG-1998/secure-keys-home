import { useState, useEffect } from 'react'

interface SearchCacheItem {
  query: string
  filters: any
  results: any[]
  timestamp: number
  aiSuggestion: string
  mode: string
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const STORAGE_KEY = 'magit_search_cache'

export const useSearchCache = () => {
  const [cache, setCache] = useState<Map<string, SearchCacheItem>>(new Map())

  // Load cache from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const cacheMap = new Map()
        
        Object.entries(parsed).forEach(([key, value]) => {
          const item = value as SearchCacheItem
          // Only load items that haven't expired
          if (Date.now() - item.timestamp < CACHE_DURATION) {
            cacheMap.set(key, item)
          }
        })
        
        setCache(cacheMap)
      }
    } catch (error) {
      console.warn('Failed to load search cache:', error)
    }
  }, [])

  // Save cache to localStorage whenever it changes
  useEffect(() => {
    try {
      const cacheObject = Object.fromEntries(cache)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheObject))
    } catch (error) {
      console.warn('Failed to save search cache:', error)
    }
  }, [cache])

  const getCacheKey = (query: string, filters: any) => {
    return `${query}_${JSON.stringify(filters)}`
  }

  const getCachedResult = (query: string, filters: any) => {
    const key = getCacheKey(query, filters)
    const cached = cache.get(key)
    
    if (!cached) return null
    
    // Check if cache is still valid
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      cache.delete(key)
      return null
    }
    
    return cached
  }

  const setCachedResult = (query: string, filters: any, results: any[], aiSuggestion: string, mode: string) => {
    const key = getCacheKey(query, filters)
    const item: SearchCacheItem = {
      query,
      filters,
      results,
      aiSuggestion,
      mode,
      timestamp: Date.now()
    }
    
    setCache(prev => new Map(prev).set(key, item))
  }

  const clearCache = () => {
    setCache(new Map())
    localStorage.removeItem(STORAGE_KEY)
  }

  const clearExpiredCache = () => {
    const now = Date.now()
    setCache(prev => {
      const newCache = new Map()
      prev.forEach((value, key) => {
        if (now - value.timestamp < CACHE_DURATION) {
          newCache.set(key, value)
        }
      })
      return newCache
    })
  }

  return {
    getCachedResult,
    setCachedResult,
    clearCache,
    clearExpiredCache,
    cacheSize: cache.size
  }
}