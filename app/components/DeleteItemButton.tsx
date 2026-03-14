"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteItemButtonProps {
  itemId: number
  hasSale: boolean
  className?: string
}

export default function DeleteItemButton({
  itemId,
  hasSale,
  className = 'btn btn-danger'
}: DeleteItemButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    const message = hasSale
      ? 'Delete this item, all attached photos, and its sale record? This action cannot be undone.'
      : 'Delete this item and all attached photos? This action cannot be undone.'

    const confirmed = window.confirm(message)
    if (!confirmed) return

    setIsDeleting(true)
    setError('')

    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to delete item')
        return
      }

      router.push('/inventory')
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex w-full flex-col items-stretch gap-2 sm:inline-flex sm:w-auto sm:items-end">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {isDeleting ? 'Deleting...' : 'Delete Item'}
      </button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
