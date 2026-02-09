'use client'

import { useSession } from 'next-auth/react'
import { User } from 'lucide-react'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 lg:ml-64">
      <div className="lg:hidden w-10" />
      
      <h2 className="text-xl font-semibold text-gray-800">
        Admin Dashboard
      </h2>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium">
            {session?.user?.name || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  )
}
