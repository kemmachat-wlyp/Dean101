import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidateTag } from 'next/cache'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { deleteItem, getItemById, getSaleByItemId, updateItem } from '../../../../lib/inventory-data'

async function getUser() {
  const cookieStore = cookies()
  const username = cookieStore.get('username')?.value
  return username === 'admin' ? { username } : null
}

// GET - Get item by ID
export async function GET(
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

    const itemId = parseInt(params.id)
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      )
    }

    const item = await getItemById(itemId)

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    )
  }
}

// PUT - Update item by ID
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

    const itemId = parseInt(params.id)
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Check if item exists
    const existingItem = await getItemById(itemId)

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Update item
    const item = await updateItem(itemId, {
        title: body.title,
        category: body.category,
        brand: body.brand || null,
        sizeTag: body.sizeTag,
        condition: body.condition,
        yearEstimate: body.yearEstimate || null,
        color: body.color || null,
        country: body.country || null,
        notes: body.notes || null,
        cost: parseFloat(body.cost) || 0,
        targetPrice: body.targetPrice ? parseFloat(body.targetPrice) : null,
        status: body.status,
        pitToPit: body.pitToPit ? parseFloat(body.pitToPit) : null,
        length: body.length ? parseFloat(body.length) : null
    })

    revalidateTag('items')
    revalidateTag('dashboard')

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    )
  }
}

// DELETE - Delete item by ID
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

    const itemId = parseInt(params.id)
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      )
    }

    const item = await getItemById(itemId)

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    const sale = await getSaleByItemId(itemId)

    for (const photo of item.photos) {
      const fullPath = path.join(process.cwd(), 'public', photo.filePath.replace(/^\/+/, ''))
      if (existsSync(fullPath)) {
        await unlink(fullPath)
      }
    }

    await deleteItem(itemId)

    revalidateTag('items')
    revalidateTag('dashboard')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
}
