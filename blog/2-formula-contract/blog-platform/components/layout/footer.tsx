import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog</h3>
            <p className="text-gray-600 text-sm">
              分享技術、生活與思考的部落格平台
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">快速連結</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
                  首頁
                </Link>
              </li>
              <li>
                <Link href="/tags" className="text-gray-600 hover:text-gray-900 text-sm">
                  標籤
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-600 hover:text-gray-900 text-sm">
                  分類
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-600 hover:text-gray-900 text-sm">
                  搜尋
                </Link>
              </li>
            </ul>
          </div>

          {/* Admin */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">管理</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/admin/login" className="text-gray-600 hover:text-gray-900 text-sm">
                  管理後台
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {currentYear} Blog. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
