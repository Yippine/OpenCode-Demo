import { Sidebar } from '@/components/admin/sidebar'
import { Header } from '@/components/admin/header'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <Header />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
