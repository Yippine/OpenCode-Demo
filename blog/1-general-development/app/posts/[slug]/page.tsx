'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ReactMarkdown from 'react-markdown'

interface Post {
  id: string
  title: string
  content: string
  excerpt: string
  coverImage: string | null
  metaTitle: string | null
  metaDesc: string | null
  viewCount: number
  createdAt: string
  updatedAt: string
  author: {
    name: string
  }
  tags: {
    id: string
    name: string
    slug: string
  }[]
}

export default function PostPage() {
  const params = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.slug) {
      fetchPost(params.slug as string)
    }
  }, [params.slug])

  async function fetchPost(slug: string) {
    try {
      const res = await fetch(`/api/posts/${slug}`)
      const data = await res.json()
      if (data.success) {
        setPost(data.data)
        // 記錄瀏覽
        trackView(data.data.id)
      }
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setLoading(false)
    }
  }

  async function trackView(postId: string) {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          referrer: document.referrer,
          device: navigator.userAgent,
        }),
      })
    } catch (error) {
      console.error('Error tracking view:', error)
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

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">文章不存在</h1>
          <Link href="/" className="text-primary-600 hover:underline">
            返回首頁
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* SEO Meta */}
        <title>{post.metaTitle || post.title}</title>
        <meta name="description" content={post.metaDesc || post.excerpt} />
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="text-sm bg-primary-100 text-primary-700 px-3 py-1 rounded-full hover:bg-primary-200"
            >
              {tag.name}
            </Link>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-gray-500 mb-8 pb-8 border-b">
          <span>{post.author.name}</span>
          <span>•</span>
          <span>{formatDate(post.createdAt)}</span>
          <span>•</span>
          <span>{post.viewCount} 次瀏覽</span>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* Back to Home */}
        <div className="mt-12 pt-8 border-t">
          <Link 
            href="/"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← 返回首頁
          </Link>
        </div>
      </article>
    </div>
  )
}
