'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Tag } from 'lucide-react'
import { PostCard } from '@/components/post-card'
import { Pagination } from '@/components/pagination'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  createdAt: Date
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

interface TagData {
  id: string
  name: string
  slug: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface TagPostsPageClientProps {
  tag: TagData
  posts: Post[]
  pagination: PaginationData
}

export default function TagPostsPageClient({
  tag,
  posts,
  pagination,
}: TagPostsPageClientProps) {
  const [currentPage, setCurrentPage] = useState(pagination.page)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.location.href = `/tags/${tag.slug}?page=${page}`
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/tags"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回標籤列表
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{tag.name}</h1>
              <p className="text-gray-600">
                共 {pagination.total} 篇文章
              </p>
            </div>
          </div>

          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              
              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">此標籤暫無文章</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
