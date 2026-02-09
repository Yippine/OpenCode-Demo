'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Tags, Folder, Loader2 } from 'lucide-react'

interface Stats {
  postsCount: number
  tagsCount: number
  categoriesCount: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    postsCount: 0,
    tagsCount: 0,
    categoriesCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [postsRes, tagsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/posts'),
        fetch('/api/admin/tags'),
        fetch('/api/admin/categories'),
      ])

      const posts = postsRes.ok ? await postsRes.json() : { posts: [] }
      const tags = tagsRes.ok ? await tagsRes.json() : []
      const categories = categoriesRes.ok ? await categoriesRes.json() : []

      setStats({
        postsCount: posts.posts?.length || 0,
        tagsCount: tags.length || 0,
        categoriesCount: categories.length || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Posts
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.postsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tags
            </CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tagsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Categories
            </CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categoriesCount}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
