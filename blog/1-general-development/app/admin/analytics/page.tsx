'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface AnalyticsData {
  overview: {
    totalPosts: number
    publishedPosts: number
    draftPosts: number
    totalTags: number
    totalViews: number
  }
  dailyViews: {
    date: string
    _sum: {
      pageView: number
    }
  }[]
  popularPosts: {
    id: string
    title: string
    slug: string
    viewCount: number
  }[]
  popularTags: {
    id: string
    name: string
    _count: {
      posts: number
    }
  }[]
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token) {
      router.push('/admin/login')
      return
    }

    if (userData) {
      setUser(JSON.parse(userData))
    }

    fetchAnalytics(token)
  }, [router])

  async function fetchAnalytics(token: string) {
    try {
      const res = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (res.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/admin/login')
        return
      }

      const result = await res.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/admin/login')
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
    })
  }

  // 準備圖表數據
  const dailyViewsChartData = {
    labels: data?.dailyViews.map(d => formatDate(d.date)) || [],
    datasets: [
      {
        label: '每日瀏覽量',
        data: data?.dailyViews.map(d => d._sum.pageView) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const popularPostsChartData = {
    labels: data?.popularPosts.map(p => p.title.substring(0, 20) + '...') || [],
    datasets: [
      {
        label: '瀏覽次數',
        data: data?.popularPosts.map(p => p.viewCount) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
    ],
  }

  const popularTagsChartData = {
    labels: data?.popularTags.map(t => t.name) || [],
    datasets: [
      {
        data: data?.popularTags.map(t => t._count.posts) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">管理後台</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700"
              >
                登出
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-screen">
          <nav className="p-4 space-y-2">
            <Link 
              href="/admin"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              文章管理
            </Link>
            <Link 
              href="/admin/tags"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              標籤管理
            </Link>
            <Link 
              href="/admin/analytics"
              className="block px-4 py-2 bg-primary-100 text-primary-700 rounded-lg"
            >
              數據分析
            </Link>
            <Link 
              href="/"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              查看網站
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <h2 className="text-2xl font-bold mb-6">數據分析</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : data ? (
            <div className="space-y-8">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-sm text-gray-600 mb-1">總文章數</p>
                  <p className="text-3xl font-bold text-gray-900">{data.overview.totalPosts}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-sm text-gray-600 mb-1">已發布</p>
                  <p className="text-3xl font-bold text-green-600">{data.overview.publishedPosts}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-sm text-gray-600 mb-1">草稿</p>
                  <p className="text-3xl font-bold text-yellow-600">{data.overview.draftPosts}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-sm text-gray-600 mb-1">標籤數</p>
                  <p className="text-3xl font-bold text-blue-600">{data.overview.totalTags}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-sm text-gray-600 mb-1">總瀏覽數</p>
                  <p className="text-3xl font-bold text-purple-600">{data.overview.totalViews.toLocaleString()}</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Daily Views Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">最近 7 天瀏覽趨勢</h3>
                  <Line 
                    data={dailyViewsChartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0,
                          },
                        },
                      },
                    }}
                  />
                </div>

                {/* Popular Posts Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">熱門文章 TOP 5</h3>
                  <Bar 
                    data={popularPostsChartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Popular Tags Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">熱門標籤分佈</h3>
                <div className="max-w-md mx-auto">
                  <Pie 
                    data={popularTagsChartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Popular Posts Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">熱門文章詳情</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        排名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        文章標題
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        瀏覽數
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.popularPosts.map((post, index) => (
                      <tr key={post.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          #{index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link 
                            href={`/posts/${post.slug}`}
                            className="text-sm font-medium text-primary-600 hover:text-primary-900"
                          >
                            {post.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {post.viewCount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              無法載入數據
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
