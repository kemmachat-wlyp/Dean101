import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getDashboardSnapshot } from '../../lib/inventory-data'

async function getUser() {
  const cookieStore = cookies()
  const username = cookieStore.get('username')?.value
  return username === 'admin' ? { username } : null
}

export default async function Dashboard() {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }

  const { items, available, sold, revenue, profit, inventoryValue, totalCost } = await getDashboardSnapshot()

  return (
    <div className="space-y-6">
      <div className="hero-panel p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-gray-500">Vintage Ops</p>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle mt-3">
              A cleaner control room for inventory, revenue, and fast daily actions across your vintage catalog.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/inventory" className="btn btn-primary">
              View Inventory
            </Link>
            <Link href="/sales/new" className="btn btn-success">
              Record Sale
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Snapshot</h2>
          <p className="page-subtitle mt-1">Key metrics for stock, sales, and capital.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Total Inventory" value={items} />
        <Card title="Available" value={available} />
        <Card title="Items Sold This Month" value={sold} />
        <Card title="Monthly Revenue" value={"$" + revenue.toFixed(2)} />
        <Card title="Monthly Net Profit" value={"$" + profit.toFixed(2)} />
        <Card title="Total Inventory Value" value={"$" + inventoryValue.toFixed(2)} />
        <Card title="Total Cost of All Items" value={"$" + totalCost.toFixed(2)} />
      </div>

      <div className="panel p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/inventory/new" className="panel-subtle p-5 text-center hover:-translate-y-0.5">
            <div className="text-2xl mb-2">+</div>
            <div className="font-semibold">Add New Item</div>
            <div className="page-subtitle mt-1 text-sm">Create a fresh listing with pricing and measurements.</div>
          </Link>
          <Link href="/inventory" className="panel-subtle p-5 text-center hover:-translate-y-0.5">
            <div className="text-2xl mb-2">Catalog</div>
            <div className="font-semibold">View All Items</div>
            <div className="page-subtitle mt-1 text-sm">Review stock, covers, status, and edits.</div>
          </Link>
          <Link href="/sales/new" className="panel-subtle p-5 text-center hover:-translate-y-0.5">
            <div className="text-2xl mb-2">Sale</div>
            <div className="font-semibold">Record Sale</div>
            <div className="page-subtitle mt-1 text-sm">Convert completed orders into clean sales records.</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

function Card({ title, value }: { title: string, value: any }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{title}</div>
      <div className="metric-value">{value}</div>
    </div>
  )
}
