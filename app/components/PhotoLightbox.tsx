"use client"

import { useEffect } from 'react'

interface LightboxPhoto {
  filePath: string
  alt: string
  isCover?: boolean
}

interface PhotoLightboxProps {
  photos: LightboxPhoto[]
  activeIndex: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

export default function PhotoLightbox({
  photos,
  activeIndex,
  onClose,
  onNext,
  onPrev,
}: PhotoLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') onNext()
      if (event.key === 'ArrowLeft') onPrev()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onNext, onPrev])

  const photo = photos[activeIndex]
  if (!photo) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onClose()
        }}
        className="absolute right-4 top-4 btn btn-secondary"
      >
        Close
      </button>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onPrev()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 btn btn-secondary"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onNext()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 btn btn-secondary"
          >
            Next
          </button>
        </>
      )}

      <div
        className="flex max-h-[92vh] w-full max-w-6xl flex-col items-center gap-4"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={photo.filePath}
          alt={photo.alt}
          className="max-h-[78vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
        />
        <div className="flex items-center gap-3 rounded-full border px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
          <span>{activeIndex + 1} / {photos.length}</span>
          {photo.isCover && <span className="badge">Cover Photo</span>}
        </div>
      </div>
    </div>
  )
}
