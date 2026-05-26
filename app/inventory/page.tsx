'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import type { InventoryItem } from '@/lib/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtPrice(value: number): string {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(value)
}

// ─── Modal: Add / Edit ────────────────────────────────────────────────────────

interface ItemForm {
  itemCode: string
  partNumber: string
  itemName: string
  brand: string
  basePrice: string
  sellingPrice: string
}

const EMPTY_FORM: ItemForm = { itemCode: '', partNumber: '', itemName: '', brand: '', basePrice: '', sellingPrice: '' }

interface ItemModalProps {
  mode: 'add' | 'edit'
  initial?: ItemForm
  onClose: () => void
  onSave: (form: ItemForm) => Promise<void>
}

function ItemModal({ mode, initial, onClose, onSave }: ItemModalProps) {
  const [form, setForm] = useState<ItemForm>(initial ?? EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field: keyof ItemForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.itemName.trim()) { setError('Item name is required.'); return }
    setSaving(true)
    setError('')
    try {
      await onSave(form)
    } catch {
      setError('Failed to save. Check your connection and try again.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            {mode === 'add' ? 'Add Inventory Item' : 'Edit Inventory Item'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Item Code</label>
              <input
                value={form.itemCode}
                onChange={e => set('itemCode', e.target.value)}
                placeholder="e.g. TY-BP-001"
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Part Number</label>
              <input
                value={form.partNumber}
                onChange={e => set('partNumber', e.target.value)}
                placeholder="e.g. 04465-0K350"
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Item Name <span className="text-red-500">*</span></label>
            <input
              value={form.itemName}
              onChange={e => set('itemName', e.target.value)}
              placeholder="e.g. Brake Pad"
              required
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Brand</label>
            <input
              value={form.brand}
              onChange={e => set('brand', e.target.value)}
              placeholder="e.g. Toyota"
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Base Price (Rp)</label>
              <input
                type="number"
                min="0"
                value={form.basePrice}
                onChange={e => set('basePrice', e.target.value)}
                placeholder="e.g. 124500"
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Selling Price (Rp)</label>
              <input
                type="number"
                min="0"
                value={form.sellingPrice}
                onChange={e => set('sellingPrice', e.target.value)}
                placeholder="e.g. 145000"
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {saving ? 'Saving…' : mode === 'add' ? 'Add Item' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Modal: Delete confirmation ───────────────────────────────────────────────

interface DeleteModalProps {
  item: InventoryItem
  onClose: () => void
  onConfirm: () => Promise<void>
}

function DeleteModal({ item, onClose, onConfirm }: DeleteModalProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    setDeleting(true)
    setError('')
    try {
      await onConfirm()
    } catch {
      setError('Failed to delete. Check your connection and try again.')
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">Delete Item</h2>
        <p className="text-sm text-gray-600 mb-1">
          Are you sure you want to delete <span className="font-medium text-gray-800">{item.itemName}</span>?
        </p>
        <p className="text-xs text-gray-500 mb-5">This cannot be undone.</p>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type SortCol = 'itemCode' | 'partNumber' | 'itemName' | 'brand' | 'basePrice' | 'sellingPrice'

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastSynced, setLastSynced] = useState<Date | null>(null)

  const [showAdd, setShowAdd] = useState(false)
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null)

  // Per-column search
  const [searchCode, setSearchCode] = useState('')
  const [searchPart, setSearchPart] = useState('')
  const [searchName, setSearchName] = useState('')
  const [searchBrand, setSearchBrand] = useState('')

  // Sorting — default: item code A-Z
  const [sortCol, setSortCol] = useState<SortCol>('itemCode')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Pagination
  const PAGE_SIZE = 100
  const [page, setPage] = useState(1)

  useEffect(() => { setPage(1) }, [searchCode, searchPart, searchName, searchBrand, sortCol, sortDir])

  function handleSort(col: SortCol) {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  function sortIcon(col: SortCol) {
    if (sortCol !== col) return <span className="ml-1 text-gray-300">⇅</span>
    return sortDir === 'asc'
      ? <span className="ml-1 text-blue-500">↑</span>
      : <span className="ml-1 text-blue-500">↓</span>
  }

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/inventory')
      if (!res.ok) throw new Error(await res.text())
      const data: InventoryItem[] = await res.json()
      setItems(data)
      setLastSynced(new Date())
    } catch {
      setError('Failed to load inventory. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    const q = {
      code:  searchCode.toLowerCase(),
      part:  searchPart.toLowerCase(),
      name:  searchName.toLowerCase(),
      brand: searchBrand.toLowerCase(),
    }
    let result = items.filter(item =>
      item.itemCode.toLowerCase().includes(q.code) &&
      item.partNumber.toLowerCase().includes(q.part) &&
      item.itemName.toLowerCase().includes(q.name) &&
      item.brand.toLowerCase().includes(q.brand)
    )
    result = [...result].sort((a, b) => {
      const valA = a[sortCol] ?? ''
      const valB = b[sortCol] ?? ''
      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return result
  }, [items, searchCode, searchPart, searchName, searchBrand, sortCol, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page, PAGE_SIZE]
  )

  async function handleAdd(form: ItemForm) {
    const res = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) throw new Error(await res.text())
    setShowAdd(false)
    await load()
  }

  async function handleEdit(form: ItemForm) {
    if (!editItem) return
    const res = await fetch(`/api/inventory/${editItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) throw new Error(await res.text())
    setEditItem(null)
    await load()
  }

  async function handleDelete() {
    if (!deleteItem) return
    const res = await fetch(`/api/inventory/${deleteItem.id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(await res.text())
    setDeleteItem(null)
    await load()
  }

  const thClass = 'px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-gray-700'

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {lastSynced ? `Last synced: ${lastSynced.toLocaleTimeString()}` : 'Loading…'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              {loading ? 'Syncing…' : 'Sync'}
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-1.5 text-sm rounded-lg bg-blue-700 text-white hover:bg-blue-800"
            >
              + Add Item
            </button>
          </div>
        </div>

        {/* Per-column search */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <input
            value={searchCode}
            onChange={e => setSearchCode(e.target.value)}
            placeholder="Item Code…"
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={searchPart}
            onChange={e => setSearchPart(e.target.value)}
            placeholder="Part Number…"
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            placeholder="Item Name…"
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={searchBrand}
            onChange={e => setSearchBrand(e.target.value)}
            placeholder="Brand…"
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-500">Loading inventory…</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-500">
                {(searchCode || searchPart || searchName || searchBrand)
                  ? 'No items match your search.'
                  : 'No inventory items yet. Click "Add Item" to get started.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className={`${thClass} text-left`} onClick={() => handleSort('itemCode')}>
                      Item Code{sortIcon('itemCode')}
                    </th>
                    <th className={`${thClass} text-left`} onClick={() => handleSort('partNumber')}>
                      Part Number{sortIcon('partNumber')}
                    </th>
                    <th className={`${thClass} text-left`} onClick={() => handleSort('itemName')}>
                      Item Name{sortIcon('itemName')}
                    </th>
                    <th className={`${thClass} text-left`} onClick={() => handleSort('brand')}>
                      Brand{sortIcon('brand')}
                    </th>
                    <th className={`${thClass} text-right`} onClick={() => handleSort('basePrice')}>
                      Base Price{sortIcon('basePrice')}
                    </th>
                    <th className={`${thClass} text-right`} onClick={() => handleSort('sellingPrice')}>
                      Selling Price{sortIcon('sellingPrice')}
                    </th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{item.itemCode || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{item.partNumber || '—'}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{item.itemName}</td>
                      <td className="px-4 py-3 text-gray-600">{item.brand || '—'}</td>
                      <td className="px-4 py-3 text-right text-gray-600 tabular-nums">{item.basePrice ? fmtPrice(item.basePrice) : '—'}</td>
                      <td className="px-4 py-3 text-right text-gray-600 tabular-nums">{item.sellingPrice ? fmtPrice(item.sellingPrice) : '—'}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setEditItem(item)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteItem(item)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4">
            <p className="text-xs text-gray-400">
              {filtered.length < items.length
                ? `${filtered.length} of ${items.length} items`
                : `${items.length} item${items.length !== 1 ? 's' : ''}`}
              {totalPages > 1 && ` — page ${page} of ${totalPages}`}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAdd && (
        <ItemModal mode="add" onClose={() => setShowAdd(false)} onSave={handleAdd} />
      )}
      {editItem && (
        <ItemModal
          mode="edit"
          initial={{ itemCode: editItem.itemCode, partNumber: editItem.partNumber, itemName: editItem.itemName, brand: editItem.brand, basePrice: String(editItem.basePrice || ''), sellingPrice: String(editItem.sellingPrice || '') }}
          onClose={() => setEditItem(null)}
          onSave={handleEdit}
        />
      )}
      {deleteItem && (
        <DeleteModal item={deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} />
      )}
    </div>
  )
}
