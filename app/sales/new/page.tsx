"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function RecordSale() {
  const [items, setItems] = useState<any[]>([])
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [formData, setFormData] = useState({
    platform: '',
    sellPrice: '',
    platformFee: '',
    shippingCost: '',
    saleDate: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const itemId = searchParams.get('itemId')

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/items')
        if (res.ok) {
          const data = await res.json()
          setItems(data)
          
          // If itemId is provided in URL, select that item
          if (itemId) {
            const item = data.find((i: any) => i.id === parseInt(itemId))
            if (item && item.status !== 'Sold') {
              setSelectedItem(item)
            }
          }
        }
      } catch (err) {
        setError('Failed to load items')
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [itemId])

  const handleItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const itemId = parseInt(e.target.value)
    const item = items.find(i => i.id === itemId)
    setSelectedItem(item)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const calculateNetProfit = () => {
    if (!selectedItem) return 0
    const sellPrice = parseFloat(formData.sellPrice) || 0
    const platformFee = parseFloat(formData.platformFee) || 0
    const shippingCost = parseFloat(formData.shippingCost) || 0
    const cost = selectedItem.cost || 0
    return sellPrice - cost - platformFee - shippingCost
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    if (!selectedItem) {
      setError('Please select an item')
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItem.id,
          platform: formData.platform,
          sellPrice: parseFloat(formData.sellPrice) || 0,
          platformFee: parseFloat(formData.platformFee) || 0,
          shippingCost: parseFloat(formData.shippingCost) || 0,
          netProfit: calculateNetProfit(),
          saleDate: new Date(formData.saleDate).toISOString()
        }),
      })

      if (res.ok) {
        router.push(`/inventory/${selectedItem.id}`)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to record sale')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Record Sale</h1>
        <button
          onClick={() => router.back()}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Back
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Item Selection */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold mb-4">Select Item</h2>
            
            <div className="mb-4">
              <label htmlFor="itemId" className="block text-sm font-medium text-gray-700 mb-1">Item *</label>
              <select
                id="itemId"
                value={selectedItem?.id || ''}
                onChange={handleItemChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an item</option>
                {items
                  .filter(item => item.status !== 'Sold')
                  .map(item => (
                    <option key={item.id} value={item.id}>
                      {item.itemId} - {item.title} (${item.cost.toFixed(2)})
                    </option>
                  ))}
              </select>
            </div>
            
            {selectedItem && (
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h3 className="font-medium">Selected Item Details</h3>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div><span className="font-medium">ID:</span> {selectedItem.itemId}</div>
                  <div><span className="font-medium">Title:</span> {selectedItem.title}</div>
                  <div><span className="font-medium">Category:</span> {selectedItem.category}</div>
                  <div><span className="font-medium">Cost:</span> ${selectedItem.cost.toFixed(2)}</div>
                  <div><span className="font-medium">Status:</span> {selectedItem.status}</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Sale Information */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold mb-4">Sale Information</h2>
          </div>
          
          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">Platform *</label>
            <input
              type="text"
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="sellPrice" className="block text-sm font-medium text-gray-700 mb-1">Sell Price ($) *</label>
            <input
              type="number"
              id="sellPrice"
              name="sellPrice"
              value={formData.sellPrice}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="platformFee" className="block text-sm font-medium text-gray-700 mb-1">Platform Fee ($)</label>
            <input
              type="number"
              id="platformFee"
              name="platformFee"
              value={formData.platformFee}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="shippingCost" className="block text-sm font-medium text-gray-700 mb-1">Shipping Cost ($)</label>
            <input
              type="number"
              id="shippingCost"
              name="shippingCost"
              value={formData.shippingCost}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="saleDate" className="block text-sm font-medium text-gray-700 mb-1">Sale Date *</label>
            <input
              type="date"
              id="saleDate"
              name="saleDate"
              value={formData.saleDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Net Profit ($)</label>
            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              ${calculateNetProfit().toFixed(2)}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !selectedItem}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {submitting ? 'Recording...' : 'Record Sale'}
          </button>
        </div>
      </form>
    </div>
  )
}