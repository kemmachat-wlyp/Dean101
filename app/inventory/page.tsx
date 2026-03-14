import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DeleteItemButton from '../components/DeleteItemButton'
import { listCategoriesWithCounts, listItems, listSizeTagsWithCounts } from '../../lib/inventory-data'

async function getUser() {
  const cookieStore = cookies()
  const username = cookieStore.get('username')?.value
  return username === 'admin' ? { username } : null
}

export default async function Inventory({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }

  // Get filter values
  const search = typeof searchParams.search === 'string' ? searchParams.search : ''
  const category = typeof searchParams.category === 'string' ? searchParams.category : ''
  const status = typeof searchParams.status === 'string' ? searchParams.status : ''
  const sizeTag = typeof searchParams.sizeTag === 'string' ? searchParams.sizeTag : ''

  // Build where clause
  const items = await listItems({ search, category, status, sizeTag })
  const categories = await listCategoriesWithCounts()
  const sizeTags = await listSizeTagsWithCounts()

  const statuses = [
    { value: 'Draft', label: 'Draft' },
    { value: 'InStock', label: 'In Stock' },
    { value: 'Listed', label: 'Listed' },
    { value: 'Reserved', label: 'Reserved' },
    { value: 'Sold', label: 'Sold' }
  ]

  return (
    <div className="space-y-6">
      <div className="hero-panel p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            ← Back to Dashboard
            </Link>
            <div>
              <h1 className="page-title">Inventory</h1>
              <p className="page-subtitle mt-2">Search, filter, edit, and clean up stock from one place.</p>
            </div>
          </div>
          <Link href="/inventory/new" className="btn btn-primary">
            Add New Item
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="panel p-6">
        <form method="GET" className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="field-label">Search</label>
            <input
              type="text"
              id="search"
              name="search"
              defaultValue={search}
              placeholder="Item ID or Title"
              className="field-input"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="field-label">Category</label>
            <select
              id="category"
              name="category"
              defaultValue={category}
              className="field-input"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.category} value={cat.category || ''}>
                  {cat.category} ({cat._count})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="field-label">Status</label>
            <select
              id="status"
              name="status"
              defaultValue={status}
              className="field-input"
            >
              <option value="">All Statuses</option>
              {statuses.map((stat) => (
                <option key={stat.value} value={stat.value}>
                  {stat.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="sizeTag" className="field-label">Size</label>
            <select
              id="sizeTag"
              name="sizeTag"
              defaultValue={sizeTag}
              className="field-input"
            >
              <option value="">All Sizes</option>
              {sizeTags.map((size) => (
                <option key={size.sizeTag} value={size.sizeTag || ''}>
                  {size.sizeTag} ({size._count})
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-4 flex justify-end space-x-2">
            <button
              type="submit"
              className="btn btn-primary"
            >
              Filter
            </button>
            <Link
              href="/inventory"
              className="btn btn-secondary"
            >
              Clear
            </Link>
          </div>
        </form>
      </div>

      {/* Items Table */}
      <div className="table-shell">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sell Price</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Profit</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => {
              const coverPhoto = item.photos.find((photo) => photo.isCover) || item.photos[0]

              return (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {coverPhoto ? (
                        <img 
                          src={coverPhoto.filePath} 
                          alt={item.title} 
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No Image</span>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.itemId}</div>
                        <div className="text-sm text-gray-500">{item.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sizeTag}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${item.status === 'Sold' ? 'bg-red-100 text-red-800' : 
                        item.status === 'InStock' ? 'bg-green-100 text-green-800' : 
                        item.status === 'Listed' ? 'bg-blue-100 text-blue-800' : 
                        item.status === 'Reserved' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.cost.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.sale ? `$${item.sale.sellPrice.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {item.sale ? `$${item.sale.netProfit.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/inventory/${item.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                      View
                    </Link>
                    <Link href={`/inventory/${item.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                      Edit
                    </Link>
                    <DeleteItemButton
                      itemId={item.id}
                      hasSale={Boolean(item.sale)}
                      className="bg-transparent p-0 text-red-600 hover:text-red-900 font-medium"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        
        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found</p>
          </div>
        )}
      </div>
    </div>
  )
}
