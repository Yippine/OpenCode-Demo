import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary-600">
              部落格
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-700 hover:text-primary-600">
              首頁
            </Link>
            <Link href="/tags" className="text-gray-700 hover:text-primary-600">
              標籤
            </Link>
            <Link 
              href="/admin/login" 
              className="text-gray-700 hover:text-primary-600"
            >
              管理
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
