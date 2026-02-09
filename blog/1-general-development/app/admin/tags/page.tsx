'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

interface Tag {
  id: string
  name: string
  slug: string
  description: string | null
  _count: {
    posts: number
  }
}

export default function TagsManagementPage() {
  const router = useRouter()
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // 新增/編輯標籤
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [tagName, setTagName] = useState('')
  const [tagDescription, setTagDescription] = useState('')

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

    fetchTags(token)
  }, [router])

  async function fetchTags(token: string) {
    try {
      const res = await fetch('/api/admin/tags', {
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

      const data = await res.json()
      if (data.success) {
        setTags(data.data)
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/admin/login')
  }

  function openEditModal(tag: Tag | null = null) {
    if (tag) {
      setIsEditing(true)
      setEditingTag(tag)
      setTagName(tag.name)
      setTagDescription(tag.description || '')
    } else {
      setIsEditing(false)
      setEditingTag(null)
      setTagName('')
      setTagDescription('')
    }
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingTag(null)
    setTagName('')
    setTagDescription('')
  }

  async function saveTag(e: React.FormEvent) {
    e.preventDefault()
    
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const url = isEditing && editingTag 
        ? `/api/admin/tags/${editingTag.id}` 
        : '/api/admin/tags'
      
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: tagName,
          description: tagDescription,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(isEditing ? '標籤更新成功' : '標籤建立成功')
        fetchTags(token)
        closeModal()
      } else {
        toast.error(data.message || '儲存失敗')
      }
    } catch (error) {
      toast.error('儲存失敗')
    }
  }

  async function deleteTag(id: string) {
    if (!confirm('確定要刪除此標籤嗎？此操作無法復原。')) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await res.json()
      if (data.success) {
        toast.success('標籤刪除成功')
        setTags(tags.filter(tag => tag.id !== id))
      } else {
        toast.error(data.message || '刪除失敗')
      }
    } catch (error) {
      toast.error('刪除失敗')
    }
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
              className="block px-4 py-2 bg-primary-100 text-primary-700 rounded-lg"
            >
              標籤管理
            </Link>
            <Link 
              href="/admin/analytics"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">標籤管理</h2>
            <button
              onClick={() => openEditModal()}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              新增標籤
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      標籤名稱
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      描述
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      文章數
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tags.map((tag) => (
                    <tr key={tag.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {tag.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          /tags/{tag.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {tag.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tag._count.posts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(tag)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          編輯
                        </button>
                        <button
                          onClick={() => deleteTag(tag.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          刪除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {isModalOpen ? (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {isEditing ? '編輯標籤' : '新增標籤'}
            </h3>
            <form onSubmit={saveTag} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  標籤名稱 *
                </label>
                <input
                  type="text"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="例如：技術、生活、旅遊"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <textarea
                  value={tagDescription}
                  onChange={(e) => setTagDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="標籤的描述（選填）"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {isEditing ? '更新' : '建立'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
