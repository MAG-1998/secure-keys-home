import { useState, useEffect } from 'react'

export interface SearchHistoryItem {
  id: string
  query: string
  timestamp: number
  filters?: {
    district?: string
    priceRange?: string
    area?: string
    propertyType?: string
  }
  isHalalMode?: boolean
  resultCount?: number
}

const STORAGE_KEY = 'magit_search_history'
const MAX_HISTORY_ITEMS = 10

export const useSearchHistory = () => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [savedSearches, setSavedSearches] = useState<SearchHistoryItem[]>([])

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setHistory(parsed.history || [])
        setSavedSearches(parsed.saved || [])
      }
    } catch (error) {
      console.warn('Failed to load search history:', error)
    }
  }, [])

  // Save to localStorage whenever history or saved searches change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        history,
        saved: savedSearches
      }))
    } catch (error) {
      console.warn('Failed to save search history:', error)
    }
  }, [history, savedSearches])

  const addToHistory = (item: Omit<SearchHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: SearchHistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now()
    }

    setHistory(prev => {
      // Remove duplicates and add new item at the beginning
      const filtered = prev.filter(h => h.query !== newItem.query)
      const updated = [newItem, ...filtered]
      // Keep only the most recent items
      return updated.slice(0, MAX_HISTORY_ITEMS)
    })
  }

  const removeFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id))
  }

  const clearHistory = () => {
    setHistory([])
  }

  const saveSearch = (item: SearchHistoryItem) => {
    const savedItem = {
      ...item,
      id: `saved_${Date.now()}`,
      timestamp: Date.now()
    }

    setSavedSearches(prev => {
      const filtered = prev.filter(s => s.query !== savedItem.query)
      return [savedItem, ...filtered].slice(0, MAX_HISTORY_ITEMS)
    })
  }

  const removeSavedSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(item => item.id !== id))
  }

  const getRecentSearches = (limit = 5) => {
    return history.slice(0, limit)
  }

  const getSearchSuggestions = (query: string, limit = 3) => {
    if (!query.trim()) return []
    
    const filtered = history.filter(item => 
      item.query.toLowerCase().includes(query.toLowerCase()) &&
      item.query.toLowerCase() !== query.toLowerCase()
    )
    
    return filtered.slice(0, limit)
  }

  return {
    history,
    savedSearches,
    addToHistory,
    removeFromHistory,
    clearHistory,
    saveSearch,
    removeSavedSearch,
    getRecentSearches,
    getSearchSuggestions
  }
}
