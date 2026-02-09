import { Suspense } from 'react'
import PostsPageClient from './posts-page-client'

export default function PostsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <PostsPageClient />
    </Suspense>
  )
}
