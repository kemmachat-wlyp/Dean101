
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main(){
 const passwordHash = await bcrypt.hash("admin123",10)

 await prisma.user.upsert({
  where:{username:"admin"},
  update:{},
  create:{username:"admin",passwordHash}
 })

 // Check if item already exists
 const existingItem = await prisma.item.findUnique({
  where: { itemId: "VT0001" }
 })

 if (!existingItem) {
  const item = await prisma.item.create({
   data:{
    itemId:"VT0001",
    title:"Vintage NASDAQ Tee",
    category:"Graphic",
    sizeTag:"L",
    condition:"Good",
    cost:25,
    targetPrice:120,
    status:"InStock"
   }
  })

  await prisma.measurement.create({
   data:{
    itemId:item.id,
    pitToPit:56,
    length:72
   }
  })
 }

 // Create a sample sold item
 const existingSoldItem = await prisma.item.findUnique({
  where: { itemId: "VT0002" }
 })

 if (!existingSoldItem) {
  const soldItem = await prisma.item.create({
   data:{
    itemId:"VT0002",
    title:"Vintage Band T-Shirt",
    category:"Music",
    sizeTag:"M",
    condition:"Excellent",
    cost:30,
    targetPrice:100,
    status:"Sold"
   }
  })

  await prisma.measurement.create({
   data:{
    itemId:soldItem.id,
    pitToPit:52,
    length:68
   }
  })

  // Create a sale for this item
  await prisma.sale.create({
   data: {
    saleId: "SL0001",
    itemId: soldItem.id,
    platform: "eBay",
    sellPrice: 95,
    platformFee: 7.60,
    shippingCost: 8.50,
    netProfit: 48.90,
    saleDate: new Date()
   }
  })
 }
}

main().then(()=>process.exit())
