"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '../components/ThemeToggle'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Invalid credentials')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hero-panel hidden p-10 lg:block">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-gray-500">Vintage Inventory System</p>
          <h1 className="page-title max-w-lg">A sharper workspace for cataloging vintage pieces.</h1>
          <p className="page-subtitle mt-4 max-w-xl">
            Track stock, manage photos, and record sales inside a cleaner interface that works comfortably in both light and dark environments.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="metric-card">
              <div className="metric-label">Inventory Control</div>
              <div className="metric-value text-2xl">Fast</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Theme Support</div>
              <div className="metric-value text-2xl">Dark Ready</div>
            </div>
          </div>
        </div>

        <div className="panel w-full max-w-md justify-self-center p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">Welcome Back</p>
              <h1 className="mt-2 text-3xl font-semibold">Sign In</h1>
            </div>
            <ThemeToggle />
          </div>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="field-label">Username</label>
              <input
                id="username"
                type="text"
                className="field-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="field-label">Password</label>
              <input
                id="password"
                type="password"
                className="field-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="btn btn-primary w-full"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
