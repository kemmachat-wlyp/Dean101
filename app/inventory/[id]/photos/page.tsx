"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PhotoLightbox from '../../../components/PhotoLightbox'

interface Photo {
  id: number
  filePath: string
  isCover: boolean
  createdAt: string
}

export default function ItemPhotos({ params }: { params: { id: string } }) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const fetchPhotos = async () => {
    try {
      const res = await fetch(`/api/items/${params.id}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        const sortedPhotos = [...(data.photos || [])].sort((a: Photo, b: Photo) => {
          if (a.isCover === b.isCover) return b.id - a.id
          return a.isCover ? -1 : 1
        })
        setPhotos(sortedPhotos)
      } else {
        setError('Failed to load photos')
      }
    } catch (err) {
      console.error('Error fetching photos:', err)
      setError('Failed to load photos')
    } finally {
      setLoading(false)
    }
  }

  // Fetch existing photos
  useEffect(() => {
    fetchPhotos()
  }, [params.id])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', files[0])
      formData.append('itemId', params.id)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        // Add the new photo to the local state
        const newPhoto: Photo = {
          id: data.photoId,
          filePath: data.path,
          isCover: data.isCover,
          createdAt: new Date().toISOString()
        }
        
        // If this photo is set as cover, update existing photos
        if (data.isCover) {
          setPhotos(prevPhotos => 
            prevPhotos.map(photo => ({
              ...photo,
              isCover: false
            })).concat(newPhoto)
          )
        } else {
          setPhotos(prevPhotos => [...prevPhotos, newPhoto])
        }
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to upload photo')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (photoId: number) => {
    if (!confirm('Are you sure you want to delete this photo?')) return

    setError('')

    try {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchPhotos()
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to delete photo')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    }
  }

  const handleSetCover = async (photoId: number) => {
    setError('')

    try {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: 'PUT',
      })

      if (res.ok) {
        await fetchPhotos()
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to set cover photo')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    }
  }

  const closeLightbox = () => setActiveIndex(null)
  const showNextPhoto = () => setActiveIndex((current) => current === null ? 0 : (current + 1) % photos.length)
  const showPrevPhoto = () => setActiveIndex((current) => current === null ? 0 : (current - 1 + photos.length) % photos.length)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mobile-page-header mb-6">
        <h1 className="text-3xl font-bold">Manage Photos</h1>
        <div className="mobile-action-row">
          <button
            onClick={() => router.push(`/inventory/${params.id}`)}
            className="btn btn-primary"
          >
            Back to Item
          </button>
          <button
            onClick={() => router.push('/inventory')}
            className="btn btn-secondary"
          >
            Back to Inventory
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="form-shell mb-6">
        <h2 className="text-xl font-bold mb-4">Upload New Photo</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:space-x-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/*"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            disabled={uploading}
          />
          {uploading && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          )}
        </div>
      </div>

      <div className="form-shell">
        <h2 className="text-xl font-bold mb-4">Existing Photos ({photos.length})</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading photos...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No photos uploaded yet.</p>
            <p className="text-gray-500 mt-2">Upload your first photo using the form above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveIndex(photos.findIndex((item) => item.id === photo.id))}
                    className="block w-full"
                  >
                    <img 
                      src={photo.filePath} 
                      alt={`Item photo`} 
                      className="w-full h-48 object-cover"
                    />
                  </button>
                  {photo.isCover && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Cover
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {new Date(photo.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Photo ID: {photo.id}</p>
                    <p className="text-xs text-gray-500 truncate">{photo.filePath.split('/').pop()}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => !photo.isCover && handleSetCover(photo.id)}
                      disabled={photo.isCover}
                      className={`text-xs font-bold py-2 px-3 rounded ${
                        photo.isCover
                          ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-700 text-white'
                      }`}
                      title={photo.isCover ? 'This photo is already the cover' : 'Set as cover'}
                    >
                      {photo.isCover ? 'Current Cover' : 'Set Cover'}
                    </button>
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-2 px-3 rounded"
                      title="Delete photo"
                    >
                      Delete Photo
                    </button>
                  </div>
                  {photo.isCover && (
                    <p className="mt-2 text-xs text-green-600 font-semibold">
                      This is the cover photo for this item
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeIndex !== null && photos.length > 0 && (
        <PhotoLightbox
          photos={photos.map((photo, index) => ({
            filePath: photo.filePath,
            alt: `Item photo ${index + 1}`,
            isCover: photo.isCover,
          }))}
          activeIndex={activeIndex}
          onClose={closeLightbox}
          onNext={showNextPhoto}
          onPrev={showPrevPhoto}
        />
      )}
    </div>
  )
}
