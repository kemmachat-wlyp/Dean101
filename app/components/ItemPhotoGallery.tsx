"use client"

import { useState } from 'react'
import PhotoLightbox from './PhotoLightbox'

interface GalleryPhoto {
  id: number
  filePath: string
  isCover: boolean
}

interface ItemPhotoGalleryProps {
  itemTitle: string
  photos: GalleryPhoto[]
}

export default function ItemPhotoGallery({ itemTitle, photos }: ItemPhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const openPhoto = (index: number) => setActiveIndex(index)
  const closePhoto = () => setActiveIndex(null)
  const showNext = () => setActiveIndex((current) => current === null ? 0 : (current + 1) % photos.length)
  const showPrev = () => setActiveIndex((current) => current === null ? 0 : (current - 1 + photos.length) % photos.length)

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => openPhoto(index)}
            className="relative overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <img
              src={photo.filePath}
              alt={`${itemTitle} photo ${index + 1}`}
              className="h-56 w-full rounded-xl object-cover transition duration-200 hover:scale-[1.02] sm:h-48"
            />
            {photo.isCover && (
              <div className="absolute left-2 top-2 bg-blue-500 px-2 py-1 text-xs text-white rounded">
                Cover
              </div>
            )}
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <PhotoLightbox
          photos={photos.map((photo, index) => ({
            filePath: photo.filePath,
            alt: `${itemTitle} photo ${index + 1}`,
            isCover: photo.isCover,
          }))}
          activeIndex={activeIndex}
          onClose={closePhoto}
          onNext={showNext}
          onPrev={showPrev}
        />
      )}
    </>
  )
}
