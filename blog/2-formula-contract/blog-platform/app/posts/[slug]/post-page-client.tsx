'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Calendar, User, Clock, Share2 } from 'lucide-react'
import { PostContent } from '@/components/post-content'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  createdAt: Date
  updatedAt: Date
  author: {
    id: string
    name: string
  }
  tags: {
    tag: {
      id: string
      name: string
      slug: string
    }
  }[]
  categories: {
    category: {
      id: string
      name: string
      slug: string
    }
  }[]
}

interface NavigationPost {
  slug: string
  title: string
}

interface RelatedPost {
  slug: string
  title: string
  excerpt: string | null
  createdAt: Date
}

interface PostPageClientProps {
  post: Post
  prevPost: NavigationPost | null
  nextPost: NavigationPost | null
  relatedPosts: RelatedPost[]
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function PostPageClient({
  post,
  prevPost,
  nextPost,
  relatedPosts,
}: PostPageClientProps) {
  const readingTime = calculateReadingTime(post.content)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('連結已複製到剪貼簿')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首頁
          </Link>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{post.author.name}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{readingTime} 分鐘閱讀</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="ml-auto"
              >
                <Share2 className="w-4 h-4 mr-1" />
                分享
              </Button>
            </div>

            {/* Categories */}
            {post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.categories.map(({ category }) => (
                  <Link key={category.id} href={`/categories/${category.slug}`}>
                    <Badge variant="outline">{category.name}</Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {post.tags.map(({ tag }) => (
                  <Link key={tag.id} href={`/tags/${tag.slug}`}>
                    <Badge variant="secondary">#{tag.name}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </header>

          {/* Content */}
          <article className="bg-white rounded-lg">
            <PostContent content={post.content} />
          </article>

          {/* Navigation */}
          <nav className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              {prevPost ? (
                <Link
                  href={`/posts/${prevPost.slug}`}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <div className="text-sm text-gray-400">上一篇</div>
                    <div className="font-medium line-clamp-1">{prevPost.title}</div>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              
              {nextPost ? (
                <Link
                  href={`/posts/${nextPost.slug}`}
                  className="flex items-center text-gray-600 hover:text-gray-900 sm:text-right"
                >
                  <div className="text-right">
                    <div className="text-sm text-gray-400">下一篇</div>
                    <div className="font-medium line-clamp-1">{nextPost.title}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </nav>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">相關文章</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/posts/${relatedPost.slug}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 line-clamp-2 mb-2">
                      {relatedPost.title}
                    </h4>
                    {relatedPost.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
