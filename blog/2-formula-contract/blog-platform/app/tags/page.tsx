'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Tag } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

interface TagData {
  id: string
  name: string
  slug: string
  _count: {
    posts: number
  }
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tags')
      const data = await response.json()
      setTags(data.tags)
    } catch (error) {
      console.error('Error fetching tags:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate font size based on post count
  const getTagSize = (count: number, maxCount: number) => {
    const minSize = 0.875 // 14px
    const maxSize = 2 // 32px
    const size = minSize + (count / maxCount) * (maxSize - minSize)
    return `${size}rem`
  }

  const maxCount = tags.length > 0 ? Math.max(...tags.map((t) => t._count.posts)) : 1

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Tag className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">標籤雲</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              瀏覽所有標籤，發現感興趣的主題
            </p>
          </div>

          {loading ? (
            <div className="flex flex-wrap justify-center gap-4">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 bg-gray-200 rounded animate-pulse"
                  style={{ width: `${Math.random() * 100 + 60}px` }}
                />
              ))}
            </div>
          ) : tags.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-4">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                  style={{ fontSize: getTagSize(tag._count.posts, maxCount) }}
                >
                  <span className="font-medium">{tag.name}</span>
                  <span className="ml-2 text-sm text-gray-400">
                    ({tag._count.posts})
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">暫無標籤</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
