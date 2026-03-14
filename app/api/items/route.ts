import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createItem, getLastItem, listItems } from '../../../lib/inventory-data'

async function getUser() {
  const cookieStore = cookies()
  const username = cookieStore.get('username')?.value
  return username === 'admin' ? { username } : null
}

// Generate unique item ID
async function generateItemId() {
  const lastItem = await getLastItem()
  
  if (!lastItem) {
    return 'VT0001'
  }
  
  const lastId = lastItem.itemId
  const lastNumber = parseInt(lastId.replace('VT', ''))
  const newNumber = lastNumber + 1
  return `VT${newNumber.toString().padStart(4, '0')}`
}

// POST - Create new item
export async function POST(req: Request) {
  try {
    // Check authentication
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    
    // Generate unique item ID
    const itemId = await generateItemId()
    
    const item = await createItem({
        itemId,
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

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
      )
  }
}

// GET - Get all items (for sales page)
export async function GET() {
  try {
    // Check authentication
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const items = await listItems()

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}
