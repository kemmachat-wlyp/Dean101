import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { createPhoto, listPhotosByItemId } from '../../../lib/inventory-data'

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

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'items', itemId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`
    const filepath = path.join(uploadDir, filename)

    // Save file
    await writeFile(filepath, new Uint8Array(buffer))

    // Return relative path for web access
    const relativePath = `/uploads/items/${itemId}/${filename}`

    // Check if this is the first photo for this item
    const numericItemId = parseInt(itemId)
    const itemPhotos = await listPhotosByItemId(numericItemId)

    const photo = await createPhoto(numericItemId, relativePath, itemPhotos.length === 0)

    return NextResponse.json({ 
      path: relativePath,
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
