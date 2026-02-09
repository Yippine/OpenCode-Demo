'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, FileText } from 'lucide-react'
import { SearchBox } from '@/components/search-box'
import { Pagination } from '@/components/pagination'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Badge } from '@/components/ui/badge'

interface SearchResult {
  id: string
  title: string
  slug: string
  excerpt: string | null
  createdAt: string
  authorName: string
  rank: number
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

function SearchResults() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [, setCurrentPage] = useState(1)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, 1)
    }
  }, [initialQuery])

  const performSearch = async (searchQuery: string, page: number) => {
    if (!searchQuery.trim()) {
      setResults([])
      setPagination(null)
      setHasSearched(false)
      return
    }

    setLoading(true)
    setHasSearched(true)
    
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=10`
      )
      const data = await response.json()
      setResults(data.posts)
      setPagination(data.pagination)
      
      // Update URL
      const url = new URL(window.location.href)
      url.searchParams.set('q', searchQuery)
      window.history.replaceState({}, '', url)
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery)
    setCurrentPage(1)
    performSearch(newQuery, 1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    performSearch(query, page)
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Highlight search terms in text
  const highlightText = (text: string, query: string) => {
    if (!query.trim() || !text) return text
    
    const terms = query.split(/\s+/).filter(Boolean)
    let highlighted = text
    
    terms.forEach((term) => {
      const regex = new RegExp(`(${term})`, 'gi')
      highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
    })
    
    return highlighted
  }

  return (
    <>
      <SearchBox onSearch={handleSearch} initialQuery={initialQuery} />

      <div className="mt-8">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-100 p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : hasSearched ? (
          <>
            <div className="mb-4 text-gray-600">
              {pagination && pagination.total > 0 ? (
                <p>
                  找到 <span className="font-semibold">{pagination.total}</span> 個結果
                  {query && (
                    <>
                      {' '}for &quot;<span className="font-semibold">{query}</span>&quot;
                    </>
                  )}
                </p>
              ) : (
                <p>未找到與 &quot;{query}&quot; 相關的結果</p>
              )}
            </div>

            {results.length > 0 && (
              <>
                <div className="space-y-4">
                  {results.map((result) => (
                    <Link
                      key={result.id}
                      href={`/posts/${result.slug}`}
                      className="block bg-white rounded-lg border border-gray-100 p-6 hover:shadow-md hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-lg font-semibold text-gray-900 mb-2"
                            dangerouslySetInnerHTML={{
                              __html: highlightText(result.title, query),
                            }}
                          />
                          
                          {result.excerpt && (
                            <p
                              className="text-gray-600 line-clamp-2 mb-3"
                              dangerouslySetInnerHTML={{
                                __html: highlightText(result.excerpt, query),
                              }}
                            />
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{result.authorName}</span>
                            <span>•</span>
                            <span>{formatDate(result.createdAt)}</span>
                            <Badge variant="secondary" className="ml-auto">
                              相關度: {(result.rank * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">輸入關鍵字開始搜尋文章</p>
          </div>
        )}
      </div>
    </>
  )
}

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <Search className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">搜尋文章</h1>
            <p className="text-gray-600">
              使用關鍵字搜尋感興趣的文章
            </p>
          </div>

          <Suspense fallback={
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          }>
            <SearchResults />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  )
}
