import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DeleteItemButton from '../../components/DeleteItemButton'
import ItemPhotoGallery from '../../components/ItemPhotoGallery'
import { getItemById } from '../../../lib/inventory-data'

async function getUser() {
  const cookieStore = cookies()
  const username = cookieStore.get('username')?.value
  return username === 'admin' ? { username } : null
}

export default async function ItemDetail({
  params
}: {
  params: { id: string }
}) {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }

  const itemId = parseInt(params.id)
  if (isNaN(itemId)) {
    redirect('/inventory')
  }

  const item = await getItemById(itemId)

  if (!item) {
    redirect('/inventory')
  }

  return (
    <div className="space-y-6">
      <div className="hero-panel p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="badge mb-3">{item.itemId}</div>
            <h1 className="page-title">{item.title}</h1>
            <p className="page-subtitle mt-3">
              Review details, swap cover photos, update pricing, and keep this item ready for sale.
            </p>
          </div>
          <div className="mobile-action-row">
          <Link 
            href={`/inventory/${item.id}/photos`} 
            className="btn btn-secondary"
          >
            Manage Photos
          </Link>
          <Link 
            href={`/inventory/${item.id}/edit`} 
            className="btn btn-primary"
          >
            Edit Item
          </Link>
          <Link 
            href="/inventory" 
            className="btn btn-secondary"
          >
            Back to Inventory
          </Link>
          <DeleteItemButton itemId={item.id} hasSale={Boolean(item.sale)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Item Details */}
        <div className="lg:col-span-2 panel p-6">
          <h2 className="text-xl font-bold mb-4">Item Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Item ID</label>
              <div className="mt-1 text-lg">{item.itemId}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Category</label>
              <div className="mt-1 text-lg">{item.category}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Size Tag</label>
              <div className="mt-1 text-lg">{item.sizeTag}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Condition</label>
              <div className="mt-1 text-lg">{item.condition}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Brand</label>
              <div className="mt-1 text-lg">{item.brand || '-'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Year Estimate</label>
              <div className="mt-1 text-lg">{item.yearEstimate || '-'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Color</label>
              <div className="mt-1 text-lg">{item.color || '-'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Country</label>
              <div className="mt-1 text-lg">{item.country || '-'}</div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500">Notes</label>
              <div className="mt-1 text-lg">{item.notes || '-'}</div>
            </div>
          </div>
        </div>

        {/* Status and Pricing */}
        <div className="space-y-6">
          <div className="panel p-6">
            <h2 className="text-xl font-bold mb-4">Status & Pricing</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full 
                    ${item.status === 'Sold' ? 'bg-red-100 text-red-800' : 
                      item.status === 'InStock' ? 'bg-green-100 text-green-800' : 
                      item.status === 'Listed' ? 'bg-blue-100 text-blue-800' : 
                      item.status === 'Reserved' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {item.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Cost</label>
                <div className="mt-1 text-lg">${item.cost.toFixed(2)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Target Price</label>
                <div className="mt-1 text-lg">${item.targetPrice?.toFixed(2) || '-'}</div>
              </div>
            </div>
          </div>

          {/* Measurements */}
          {item.measurement && (
            <div className="panel p-6">
              <h2 className="text-xl font-bold mb-4">Measurements</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Pit to Pit</label>
                  <div className="mt-1 text-lg">{item.measurement.pitToPit?.toFixed(1) || '-'} cm</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Length</label>
                  <div className="mt-1 text-lg">{item.measurement.length?.toFixed(1) || '-'} cm</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photos */}
      {item.photos.length > 0 && (
        <div className="panel p-6">
          <h2 className="text-xl font-bold mb-4">Photos</h2>
          <ItemPhotoGallery itemTitle={item.title} photos={item.photos} />
        </div>
      )}

      {/* Sale Information */}
      {item.sale && (
        <div className="panel p-6">
          <h2 className="text-xl font-bold mb-4">Sale Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Platform</label>
              <div className="mt-1 text-lg">{item.sale.platform}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Sale Date</label>
              <div className="mt-1 text-lg">{new Date(item.sale.saleDate).toLocaleDateString()}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Sell Price</label>
              <div className="mt-1 text-lg">${item.sale.sellPrice.toFixed(2)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Platform Fee</label>
              <div className="mt-1 text-lg">${item.sale.platformFee.toFixed(2)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Shipping Cost</label>
              <div className="mt-1 text-lg">${item.sale.shippingCost.toFixed(2)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Net Profit</label>
              <div className="mt-1 text-lg font-bold">${item.sale.netProfit.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Record Sale Button */}
      {!item.sale && item.status !== 'Sold' && (
        <div className="panel p-6">
          <Link 
            href={`/sales/new?itemId=${item.id}`} 
            className="btn btn-success w-full sm:w-auto"
          >
            Record Sale for This Item
          </Link>
        </div>
      )}
    </div>
  )
}
