'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import type { Customer } from '@/lib/types'

// ─── Add / Edit Modal ──────────────────────────────────────────────────────────

interface CustomerModalProps {
  mode: 'add' | 'edit'
  initial?: Customer
  onClose: () => void
  onSaved: () => void
}

function CustomerModal({ mode, initial, onClose, onSaved }: CustomerModalProps) {
  const { t } = useLanguage()
  const [customerName, setCustomerName] = useState(initial?.customerName ?? '')
  const [address, setAddress]           = useState(initial?.address ?? '')
  const [saving, setSaving]             = useState(false)
  const [saveError, setSaveError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!customerName.trim()) return
    setSaving(true)
    setSaveError('')
    try {
      if (mode === 'add') {
        const res = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerName: customerName.trim(), address: address.trim() }),
        })
        if (!res.ok) throw new Error()
      } else {
        const res = await fetch(`/api/customers/${encodeURIComponent(initial!.customerCode)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerName: customerName.trim(), address: address.trim() }),
        })
        if (!res.ok) throw new Error()
      }
      onSaved()
    } catch {
      setSaveError(t('customers.saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">
          {mode === 'add' ? t('customers.modal.add.title') : t('customers.modal.edit.title')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'add' && (
            <p className="text-xs text-gray-400 italic">{t('customers.codeGenerated')}</p>
          )}
          {mode === 'edit' && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('customers.col.code')}</label>
              <p className="text-sm font-mono text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">{initial?.customerCode}</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('customers.modal.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder={t('customers.modal.ph.name')}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('customers.modal.address')}</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder={t('customers.modal.ph.address')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {saveError && <p className="text-xs text-red-500">{saveError}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving || !customerName.trim()}
              className="flex-1 py-2 text-sm font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors"
            >
              {saving ? t('common.saving') : t('common.save')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────

interface DeleteModalProps {
  customer: Customer
  onClose: () => void
  onDeleted: () => void
}

function DeleteModal({ customer, onClose, onDeleted }: DeleteModalProps) {
  const { t } = useLanguage()
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch(`/api/customers/${encodeURIComponent(customer.customerCode)}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error()
      onDeleted()
    } catch {
      setDeleteError(t('customers.deleteError'))
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-2">{t('common.delete')} {customer.customerName}</h2>
        <p className="text-sm text-gray-500 mb-5">{t('customers.confirmDelete')}</p>
        {deleteError && <p className="text-xs text-red-500 mb-3">{deleteError}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {deleting ? t('common.saving') : t('common.delete')}
          </button>
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const { t } = useLanguage()

  const [customers, setCustomers]     = useState<Customer[]>([])
  const [loading, setLoading]         = useState(true)
  const [loadError, setLoadError]     = useState(false)
  const [lastSynced, setLastSynced]   = useState<Date | null>(null)
  const [syncing, setSyncing]         = useState(false)

  const [showAdd, setShowAdd]           = useState(false)
  const [editTarget, setEditTarget]     = useState<Customer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)

  const [search, setSearch] = useState('')

  async function loadCustomers(showSyncing = false) {
    if (showSyncing) setSyncing(true)
    else setLoading(true)
    setLoadError(false)
    try {
      const res = await fetch('/api/customers')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCustomers(data.customers ?? [])
      setLastSynced(new Date())
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }

  useEffect(() => { loadCustomers() }, [])

  const filtered = customers.filter(c =>
    c.customerCode.toLowerCase().includes(search.toLowerCase()) ||
    c.customerName.toLowerCase().includes(search.toLowerCase()) ||
    c.address.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('customers.title')}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {lastSynced
                ? `${t('common.lastSynced')} ${lastSynced.toLocaleTimeString()}`
                : t('common.never')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadCustomers(true)}
              disabled={syncing}
              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              {syncing ? t('common.syncing') : t('common.sync')}
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-1.5 text-sm font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              {t('customers.addCustomer')}
            </button>
          </div>
        </div>

        {/* Search */}
        {!loading && !loadError && customers.length > 0 && (
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('common.search')}
              className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="text-center py-16 text-gray-400 text-sm">{t('common.loading')}</div>
        )}
        {loadError && (
          <div className="text-center py-16 text-red-500 text-sm">{t('customers.error')}</div>
        )}

        {!loading && !loadError && customers.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">{t('customers.empty')}</div>
        )}

        {!loading && !loadError && customers.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">{t('common.noResults')}</div>
        )}

        {/* Table */}
        {!loading && !loadError && filtered.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('customers.col.code')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('customers.col.name')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('customers.col.address')}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(customer => (
                  <tr key={customer.customerCode} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{customer.customerCode}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{customer.customerName}</td>
                    <td className="px-4 py-3 text-gray-500">{customer.address || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditTarget(customer)}
                          className="px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(customer)}
                          className="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
              {filtered.length} {filtered.length !== customers.length ? `/ ${customers.length} ` : ''}{t('customers.title').toLowerCase()}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAdd && (
        <CustomerModal
          mode="add"
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); loadCustomers(true) }}
        />
      )}
      {editTarget && (
        <CustomerModal
          mode="edit"
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); loadCustomers(true) }}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          customer={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => { setDeleteTarget(null); loadCustomers(true) }}
        />
      )}
    </div>
  )
}
