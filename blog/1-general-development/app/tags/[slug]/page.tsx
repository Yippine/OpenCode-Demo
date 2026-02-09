'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'

interface Tag {
  id: string
  name: string
  slug: string
  description: string | null
  posts: {
    id: string
    title: string
    slug: string
    excerpt: string
    coverImage: string | null
    createdAt: string
    author: {
      name: string
    }
    tags: {
      id: string
      name: string
      slug: string
    }[]
  }[]
}

export default function TagPage() {
  const params = useParams()
  const [tag, setTag] = useState<Tag | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.slug) {
      fetchTag(params.slug as string)
    }
  }, [params.slug])

  async function fetchTag(slug: string) {
    try {
      const res = await fetch(`/api/tags/${slug}`)
      const data = await res.json()
      if (data.success) {
        setTag(data.data)
      }
    } catch (error) {
      console.error('Error fetching tag:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!tag) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">標籤不存在</h1>
          <Link href="/tags" className="text-primary-600 hover:underline">
            返回標籤列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{tag.name}</h1>
          {tag.description && (
            <p className="text-gray-600">{tag.description}</p>
          )}
          <p className="text-gray-500 mt-2">
            共 {tag.posts.length} 篇文章
          </p>
        </div>

        {tag.posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            此標籤下暫無文章
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tag.posts.map((post) => (
              <article 
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((t) => (
                      <span
                        key={t.id}
                        className={`text-xs px-2 py-1 rounded-full ${
                          t.id === tag.id 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-primary-100 text-primary-700'
                        }`}
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-xl font-semibold mb-2">
                    <Link 
                      href={`/posts/${post.slug}`}
                      className="text-gray-900 hover:text-primary-600"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{post.author.name}</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
