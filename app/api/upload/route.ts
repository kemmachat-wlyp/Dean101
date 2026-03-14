import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createPhoto, listPhotosByItemId } from '../../../lib/inventory-data'
import { uploadPhotoToStorage } from '../../../lib/photo-storage'

async function getUser() {
  const cookieStore = cookies()
  const username = cookieStore.get('username')?.value
  return username === 'admin' ? { username } : null
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const itemId = formData.get('itemId') as string | null

    if (!file || !itemId) {
      return NextResponse.json(
        { error: 'File and item ID are required' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Check if this is the first photo for this item
    const numericItemId = parseInt(itemId)
    const uploadedPhoto = await uploadPhotoToStorage({
      itemId: numericItemId,
      originalName: file.name,
      contentType: file.type,
      buffer,
    })
    const itemPhotos = await listPhotosByItemId(numericItemId)

    const photo = await createPhoto(numericItemId, uploadedPhoto.publicUrl, itemPhotos.length === 0)

    return NextResponse.json({ 
      path: uploadedPhoto.publicUrl,
      photoId: photo.id,
      isCover: photo.isCover 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
