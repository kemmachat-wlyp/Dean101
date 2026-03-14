"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ThemeToggle from './ThemeToggle'

export default function Navigation() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      if (res.ok) {
        setIsMenuOpen(false)
        router.push('/login')
        router.refresh()
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav className="glass-nav sticky top-0 z-30 mb-6">
      <div className="app-container py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start justify-between gap-4 md:flex-1 md:items-center">
            <div className="mr-2">
              <div className="text-xs uppercase tracking-[0.28em] text-gray-500">Vintage Ops</div>
              <div className="text-lg font-semibold text-theme">Inventory System</div>
            </div>
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="btn btn-secondary md:hidden"
            >
              {isMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
          <div className={`${isMenuOpen ? 'flex' : 'hidden'} flex-col gap-3 md:flex md:flex-1 md:flex-row md:items-center md:justify-between`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
              <Link href="/inventory" className="text-gray-700 hover:text-blue-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                Inventory
              </Link>
              <Link href="/sales/new" className="text-gray-700 hover:text-blue-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                Record Sale
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="btn btn-danger"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
