import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSale, getItemById } from '../../../lib/inventory-data'

async function getUser() {
  const cookieStore = cookies()
  const username = cookieStore.get('username')?.value
  return username === 'admin' ? { username } : null
}

// Generate unique sale ID
function generateSaleId() {
  return `SL${Date.now().toString().slice(-8)}`
}

// POST - Create new sale
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
    
    // Check if item exists and is not already sold
    const existingItem = await getItemById(body.itemId)

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    if (existingItem.status === 'Sold') {
      return NextResponse.json(
        { error: 'Item is already sold' },
        { status: 400 }
      )
    }

    // Generate unique sale ID
    const saleId = generateSaleId()
    
    const sale = await createSale({
      saleId,
      itemId: body.itemId,
      platform: body.platform,
      sellPrice: parseFloat(body.sellPrice) || 0,
      platformFee: parseFloat(body.platformFee) || 0,
      shippingCost: parseFloat(body.shippingCost) || 0,
      netProfit: parseFloat(body.netProfit) || 0,
      saleDate: new Date(body.saleDate).toISOString()
    })

    return NextResponse.json(sale)
  } catch (error) {
    console.error('Error creating sale:', error)
    return NextResponse.json(
      { error: 'Failed to record sale' },
      { status: 500 }
    )
  }
}
