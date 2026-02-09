'use client'

import { useState } from 'react'
import { Search, X, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchBoxProps {
  onSearch: (query: string) => void
  initialQuery?: string
}

export function SearchBox({ onSearch, initialQuery = '' }: SearchBoxProps) {
  const [query, setQuery] = useState(initialQuery)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('searchHistory') || '[]')
    }
    return []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      // Save to history
      const newHistory = [query, ...history.filter((h) => h !== query)].slice(0, 10)
      setHistory(newHistory)
      localStorage.setItem('searchHistory', JSON.stringify(newHistory))
      
      onSearch(query.trim())
      setShowHistory(false)
    }
  }

  const handleHistoryClick = (term: string) => {
    setQuery(term)
    onSearch(term)
    setShowHistory(false)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('searchHistory')
  }

  const removeHistoryItem = (term: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newHistory = history.filter((h) => h !== term)
    setHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="搜尋文章..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            className="pl-10 pr-10 py-6 text-lg"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                onSearch('')
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <Button type="submit" className="mt-4 w-full">
          <Search className="w-4 h-4 mr-2" />
          搜尋
        </Button>
      </form>

      {/* Search History */}
      {showHistory && history.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>搜尋歷史</span>
            </div>
            <button
              onClick={clearHistory}
              className="text-sm text-red-500 hover:text-red-600"
            >
              清除
            </button>
          </div>
          <ul className="py-2">
            {history.map((term, index) => (
              <li
                key={index}
                onClick={() => handleHistoryClick(term)}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between group"
              >
                <span className="text-gray-700">{term}</span>
                <button
                  onClick={(e) => removeHistoryItem(term, e)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
