import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { unlink } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'
import { deletePhoto, getPhotoById, listPhotosByItemId, setItemCoverPhoto } from '../../../../lib/inventory-data'
import { deletePhotoFromStorage } from '../../../../lib/photo-storage'

async function getUser() {
  const cookieStore = cookies()
  const username = cookieStore.get('username')?.value
  return username === 'admin' ? { username } : null
}

// DELETE - Delete photo by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const photoId = parseInt(params.id)
    if (isNaN(photoId)) {
      return NextResponse.json(
        { error: 'Invalid photo ID' },
        { status: 400 }
      )
    }

    // Find photo
    const photo = await getPhotoById(photoId)

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    if (photo.filePath.startsWith('http')) {
      try {
        await deletePhotoFromStorage(photo.filePath)
      } catch (storageError) {
        console.warn('Could not delete photo from storage:', photo.filePath, storageError)
      }
    } else {
      const fullPath = path.join(process.cwd(), 'public', photo.filePath.replace(/^\/+/, ''))
      if (existsSync(fullPath)) {
        try {
          await unlink(fullPath)
        } catch (fileError) {
          console.warn('Could not delete photo file:', fullPath, fileError)
        }
      }
    }

    await deletePhoto(photoId)

    let newCoverPhotoId: number | null = null

    if (photo.isCover) {
      const nextPhoto = (await listPhotosByItemId(photo.itemId))[0]

      if (nextPhoto) {
        await setItemCoverPhoto(nextPhoto.id, photo.itemId)
        newCoverPhotoId = nextPhoto.id
      }
    }

    return NextResponse.json({ success: true, newCoverPhotoId })
  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}

// PUT - Set photo as cover
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const photoId = parseInt(params.id)
    if (isNaN(photoId)) {
      return NextResponse.json(
        { error: 'Invalid photo ID' },
        { status: 400 }
      )
    }

    // Find photo
    const photo = await getPhotoById(photoId)

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    const updatedPhoto = await setItemCoverPhoto(photoId, photo.itemId)

    return NextResponse.json(updatedPhoto)
  } catch (error) {
    console.error('Error setting cover photo:', error)
    return NextResponse.json(
      { error: 'Failed to set cover photo' },
      { status: 500 }
    )
  }
}
