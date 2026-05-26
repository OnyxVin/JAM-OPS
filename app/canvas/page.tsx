'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import type { CanvasRun, CanvasItem, InventoryItem } from '@/lib/types'

const SALES_REPS = ['Tonny', 'Rudi']

// ─── Utility helpers ──────────────────────────────────────────────────────────

function todayDDMMYYYY(): string {
  const now = new Date()
  const d = String(now.getDate()).padStart(2, '0')
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${d}/${m}/${now.getFullYear()}`
}

function toInputDate(ddmmyyyy: string): string {
  if (!ddmmyyyy) return ''
  const parts = ddmmyyyy.split('/')
  if (parts.length !== 3) return ''
  return `${parts[2]}-${parts[1]}-${parts[0]}`
}

function fromInputDate(yyyymmdd: string): string {
  if (!yyyymmdd) return ''
  const parts = yyyymmdd.split('-')
  if (parts.length !== 3) return ''
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function parseDDMMYYYY(s: string): Date {
  if (!s) return new Date(0)
  const parts = s.split('/')
  if (parts.length !== 3) return new Date(0)
  const [d, m, y] = parts.map(Number)
  if (!d || !m || !y) return new Date(0)
  return new Date(y, m - 1, d)
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function RunStatusBadge({ status }: { status: 'Open' | 'Closed' }) {
  const { t } = useLanguage()
  return status === 'Open' ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
      {t('status.open')}
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
      {t('status.closed')}
    </span>
  )
}

// ─── Items table ──────────────────────────────────────────────────────────────

function ItemsTable({ run }: { run: CanvasRun }) {
  const { t } = useLanguage()

  if (run.items.length === 0) {
    return <p className="text-sm text-gray-400 italic py-2">{t('canvas.item.noItems')}</p>
  }

  return (
    <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
      <thead>
        <tr className="bg-gray-100">
          <th className="px-3 py-2 text-left text-gray-500 font-semibold">{t('canvas.item.name')}</th>
          <th className="px-3 py-2 text-center text-gray-500 font-semibold">{t('canvas.item.brought')}</th>
          {run.status === 'Closed' && (
            <th className="px-3 py-2 text-center text-gray-500 font-semibold">{t('canvas.item.sold')}</th>
          )}
          {run.status === 'Closed' && (
            <th className="px-3 py-2 text-center text-gray-500 font-semibold">{t('canvas.item.returned')}</th>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {run.items.map((item: CanvasItem, i: number) => (
          <tr key={i}>
            <td className="px-3 py-2 text-gray-700">{item.itemName}</td>
            <td className="px-3 py-2 text-center text-gray-600">{item.quantityBrought}</td>
            {run.status === 'Closed' && (
              <td className="px-3 py-2 text-center font-medium text-blue-700">
                {item.quantitySold !== null ? item.quantitySold : '—'}
              </td>
            )}
            {run.status === 'Closed' && (
              <td className="px-3 py-2 text-center font-medium text-amber-600">
                {item.quantityReturned !== null ? item.quantityReturned : '—'}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── Run card ─────────────────────────────────────────────────────────────────

interface RunCardProps {
  run: CanvasRun
  expanded: boolean
  onToggle: () => void
  onClose?: () => void
  onEdit?: () => void
  onEditQtys?: () => void
  onDelete?: () => void
}

function RunCard({ run, expanded, onToggle, onClose, onEdit, onEditQtys, onDelete }: RunCardProps) {
  const { t } = useLanguage()

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-sm font-semibold text-gray-900">{run.canvasId}</span>
          <RunStatusBadge status={run.status} />
          <span className="text-sm text-gray-600">{run.salesRepName}</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span>{t('canvas.col.dateOut')}: <span className="text-gray-700 font-medium">{run.dateOut}</span></span>
          {run.status === 'Closed' && run.dateClosed && (
            <span>{t('canvas.col.dateClosed')}: <span className="text-gray-700 font-medium">{run.dateClosed}</span></span>
          )}
          <span>{t('canvas.col.itemCount')}: <span className="text-gray-700 font-medium">{run.items.length}</span></span>
          <span>{t('canvas.col.totalBrought')}: <span className="text-gray-700 font-medium">{run.totalQuantityBrought}</span></span>
          {run.status === 'Closed' && run.totalQuantitySold !== null && (
            <span>{t('canvas.item.sold')}: <span className="text-blue-700 font-medium">{run.totalQuantitySold}</span></span>
          )}
          {run.status === 'Closed' && run.totalQuantityReturned !== null && run.totalQuantityReturned > 0 && (
            <span>{t('canvas.item.returned')}: <span className="text-amber-600 font-medium">{run.totalQuantityReturned}</span></span>
          )}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1 text-xs font-medium bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors"
              >
                {t('canvas.closeRun')}
              </button>
            )}
            {onEditQtys && (
              <button
                onClick={onEditQtys}
                className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors border border-blue-200"
              >
                Edit Qtys
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-2 py-1 text-xs font-medium bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors border border-gray-200"
              >
                {t('common.edit')}
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="px-2 py-1 text-xs font-medium bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors border border-red-100"
              >
                {t('common.delete')}
              </button>
            )}
          </div>
          <span className="text-gray-400 text-base leading-none">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-4 border-t border-gray-100 pt-3">
          <ItemsTable run={run} />
        </div>
      )}
    </div>
  )
}

// ─── Item row type + cross-field filtering helpers ───────────────────────────

type NewRunItemRow = {
  itemCode: string
  partNumber: string
  itemName: string
  brand: string
  quantityBrought: string
}

const EMPTY_ITEM_ROW: NewRunItemRow = {
  itemCode: '', partNumber: '', itemName: '', brand: '', quantityBrought: '',
}

type ItemField = 'itemCode' | 'partNumber' | 'itemName' | 'brand'

function getFieldOptions(field: ItemField, row: NewRunItemRow, inventory: InventoryItem[]): string[] {
  return Array.from(new Set(
    inventory
      .filter(inv =>
        (['itemCode', 'partNumber', 'itemName', 'brand'] as ItemField[])
          .filter(k => k !== field && row[k] !== '')
          .every(k => inv[k].toLowerCase().includes(row[k].toLowerCase()))
      )
      .map(inv => inv[field])
      .filter(Boolean)
  )).sort()
}

function tryAutoFill(row: NewRunItemRow, inventory: InventoryItem[]): NewRunItemRow {
  const nonEmpty = (['itemCode', 'partNumber', 'itemName', 'brand'] as ItemField[]).filter(k => row[k] !== '')
  if (nonEmpty.length === 0) return row
  const matches = inventory.filter(inv =>
    nonEmpty.every(k => inv[k].toLowerCase().includes(row[k].toLowerCase()))
  )
  if (matches.length !== 1) return row
  const m = matches[0]
  return {
    ...row,
    itemCode:   row.itemCode   || m.itemCode,
    partNumber: row.partNumber || m.partNumber,
    itemName:   row.itemName   || m.itemName,
    brand:      row.brand      || m.brand,
  }
}

// ─── Search input with filtered dropdown ─────────────────────────────────────

interface ItemSearchInputProps {
  value: string
  options: string[]
  placeholder?: string
  onChange: (val: string) => void
  className?: string
}

function ItemSearchInput({ value, options, placeholder, onChange, className }: ItemSearchInputProps) {
  const [open, setOpen] = useState(false)
  const filtered = options.filter(o => o.toLowerCase().includes(value.toLowerCase()))
  const showDropdown = open && filtered.length > 0

  return (
    <div className="relative">
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {showDropdown && (
        <ul className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg mt-0.5 max-h-44 overflow-y-auto">
          {filtered.slice(0, 8).map(opt => (
            <li
              key={opt}
              onMouseDown={() => { onChange(opt); setOpen(false) }}
              className="px-3 py-1.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── New Canvas Run Modal ─────────────────────────────────────────────────────

interface NewRunModalProps {
  onClose: () => void
  onSaved: () => void
}

function NewRunModal({ onClose, onSaved }: NewRunModalProps) {
  const { t } = useLanguage()
  const [canvasId, setCanvasId] = useState('')
  const [idAutoGenerated, setIdAutoGenerated] = useState(true)
  const [loadingId, setLoadingId] = useState(false)
  const [salesRep, setSalesRep] = useState('')
  const [dateOut, setDateOut] = useState(toInputDate(todayDDMMYYYY()))
  const [items, setItems] = useState<NewRunItemRow[]>([{ ...EMPTY_ITEM_ROW }])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [inventory, setInventory] = useState<InventoryItem[]>([])

  useEffect(() => {
    fetch('/api/inventory')
      .then(r => r.ok ? r.json() : [])
      .then(data => setInventory(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!idAutoGenerated) return
    const ddmmyyyy = fromInputDate(dateOut)
    if (!ddmmyyyy) return
    let cancelled = false
    setLoadingId(true)
    fetch(`/api/canvas/next-id?date=${encodeURIComponent(ddmmyyyy)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (!cancelled && data?.id) setCanvasId(data.id) })
      .finally(() => { if (!cancelled) setLoadingId(false) })
    return () => { cancelled = true }
  }, [dateOut, idAutoGenerated])

  function addItem() {
    setItems(prev => [...prev, { ...EMPTY_ITEM_ROW }])
  }

  function removeItem(index: number) {
    if (items.length <= 1) return
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  function updateItemField(index: number, field: keyof NewRunItemRow, value: string) {
    setItems(prev => {
      const updated = [...prev]
      const updatedRow = { ...updated[index], [field]: value }
      updated[index] = field !== 'quantityBrought' ? tryAutoFill(updatedRow, inventory) : updatedRow
      return updated
    })
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!salesRep) e.salesRep = t('canvas.modal.newRun.selectRep')
    if (!dateOut) e.dateOut = t('canvas.modal.newRun.dateOut') + ' required'
    const hasValidItem = items.some(
      (item) => item.itemName.trim() && item.quantityBrought && parseInt(item.quantityBrought) > 0
    )
    if (!hasValidItem) e.items = t('canvas.modal.newRun.minItems')
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSaving(true)
    setSaveError('')
    try {
      const validItems = items.filter((item) => item.itemName.trim() && item.quantityBrought && parseInt(item.quantityBrought) > 0)
      const res = await fetch('/api/canvas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canvasId: canvasId.trim() || undefined,
          salesRepName: salesRep,
          dateOut: fromInputDate(dateOut),
          items: validItems,
        }),
      })
      if (!res.ok) throw new Error()
      onSaved()
    } catch {
      setSaveError(t('canvas.saveError'))
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-base font-semibold">{t('canvas.modal.newRun.title')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('canvas.modal.newRun.salesRep')}</label>
              <select
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.salesRep ? 'border-red-400' : 'border-gray-300'}`}
                value={salesRep}
                onChange={(e) => setSalesRep(e.target.value)}
              >
                <option value="">{t('canvas.modal.newRun.selectRep')}</option>
                {SALES_REPS.map((rep) => <option key={rep} value={rep}>{rep}</option>)}
              </select>
              {errors.salesRep && <p className="text-xs text-red-500 mt-1">{errors.salesRep}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('canvas.modal.newRun.dateOut')}</label>
              <input
                type="date"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dateOut ? 'border-red-400' : 'border-gray-300'}`}
                value={dateOut}
                onChange={(e) => setDateOut(e.target.value)}
              />
              {errors.dateOut && <p className="text-xs text-red-500 mt-1">{errors.dateOut}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('canvas.col.canvasId')}</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={loadingId ? t('common.generating') : 'CVS2605001'}
              value={canvasId}
              onChange={(e) => { setIdAutoGenerated(false); setCanvasId(e.target.value) }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700">{t('canvas.modal.newRun.items')}</label>
              <button type="button" onClick={addItem} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                + {t('canvas.item.addRow')}
              </button>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_1.1fr_1.5fr_1fr_56px_20px] gap-1.5 mb-1 px-0.5">
              <span className="text-xs text-gray-400">Item Code</span>
              <span className="text-xs text-gray-400">Part Number</span>
              <span className="text-xs text-gray-400">Item Name *</span>
              <span className="text-xs text-gray-400">Brand</span>
              <span className="text-xs text-gray-400">Qty</span>
              <span />
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-[1fr_1.1fr_1.5fr_1fr_56px_20px] gap-1.5 items-start">
                  <ItemSearchInput
                    value={item.itemCode}
                    options={getFieldOptions('itemCode', item, inventory)}
                    placeholder="Code"
                    onChange={v => updateItemField(index, 'itemCode', v)}
                    className={inputCls}
                  />
                  <ItemSearchInput
                    value={item.partNumber}
                    options={getFieldOptions('partNumber', item, inventory)}
                    placeholder="Part #"
                    onChange={v => updateItemField(index, 'partNumber', v)}
                    className={inputCls}
                  />
                  <ItemSearchInput
                    value={item.itemName}
                    options={getFieldOptions('itemName', item, inventory)}
                    placeholder="Name"
                    onChange={v => updateItemField(index, 'itemName', v)}
                    className={inputCls}
                  />
                  <ItemSearchInput
                    value={item.brand}
                    options={getFieldOptions('brand', item, inventory)}
                    placeholder="Brand"
                    onChange={v => updateItemField(index, 'brand', v)}
                    className={inputCls}
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.quantityBrought}
                    onChange={e => updateItemField(index, 'quantityBrought', e.target.value)}
                    placeholder="Qty"
                    className={inputCls}
                  />
                  {items.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors text-base leading-none pt-1.5 text-center"
                    >
                      ×
                    </button>
                  ) : <span />}
                </div>
              ))}
            </div>
            {errors.items && <p className="text-xs text-red-500 mt-1">{errors.items}</p>}
          </div>

          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Edit Canvas Run Modal ────────────────────────────────────────────────────

interface EditRunModalProps {
  run: CanvasRun
  onClose: () => void
  onSaved: () => void
}

function EditRunModal({ run, onClose, onSaved }: EditRunModalProps) {
  const { t } = useLanguage()
  const [salesRep, setSalesRep] = useState(run.salesRepName)
  const [dateOut, setDateOut] = useState(toInputDate(run.dateOut))
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!salesRep || !dateOut) return
    setSaving(true)
    setSaveError('')
    try {
      const res = await fetch(`/api/canvas/${encodeURIComponent(run.canvasId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salesRepName: salesRep,
          dateOut: fromInputDate(dateOut),
        }),
      })
      if (!res.ok) throw new Error()
      onSaved()
    } catch {
      setSaveError(t('canvas.saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold">{t('canvas.modal.editRun.title')}</h2>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{run.canvasId}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('canvas.modal.newRun.salesRep')}</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={salesRep}
              onChange={(e) => setSalesRep(e.target.value)}
            >
              {SALES_REPS.map((rep) => (
                <option key={rep} value={rep}>{rep}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('canvas.modal.newRun.dateOut')}</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateOut}
              onChange={(e) => setDateOut(e.target.value)}
            />
          </div>
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete Run Confirm Modal ─────────────────────────────────────────────────

interface DeleteRunModalProps {
  run: CanvasRun
  isDeleting: boolean
  deleteError: string
  onClose: () => void
  onConfirm: () => void
}

function DeleteRunModal({ run, isDeleting, deleteError, onClose, onConfirm }: DeleteRunModalProps) {
  const { t } = useLanguage()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="px-6 pt-5 pb-4">
          <h2 className="text-base font-semibold text-gray-900 mb-2">{t('canvas.deleteRun')}</h2>
          <p className="text-sm text-gray-600 mb-2">{t('canvas.confirmDeleteRun')}</p>
          <p className="text-sm font-mono font-medium text-gray-800">
            {run.canvasId} — {run.salesRepName}
          </p>
          {deleteError && <p className="text-sm text-red-600 mt-3">{deleteError}</p>}
        </div>
        <div className="flex justify-end gap-3 px-6 pb-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? t('common.saving') : t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Close Canvas Modal ───────────────────────────────────────────────────────

interface CloseRunModalProps {
  run: CanvasRun
  onClose: () => void
  onSaved: () => void
}

function CloseRunModal({ run, onClose, onSaved }: CloseRunModalProps) {
  const { t } = useLanguage()
  const [dateClosed, setDateClosed] = useState(toInputDate(todayDDMMYYYY()))
  const [soldQtys, setSoldQtys] = useState<Record<string, string>>(
    Object.fromEntries(run.items.map((item) => [item.itemName, '']))
  )
  const [returnedQtys, setReturnedQtys] = useState<Record<string, string>>(
    Object.fromEntries(run.items.map((item) => [item.itemName, '']))
  )
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!dateClosed) return
    setSaving(true)
    setSaveError('')
    try {
      const soldItems = run.items.map((item) => ({
        itemName:         item.itemName,
        quantitySold:     soldQtys[item.itemName]     || '0',
        quantityReturned: returnedQtys[item.itemName] || '0',
      }))
      const res = await fetch(`/api/canvas/${encodeURIComponent(run.canvasId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateClosed: fromInputDate(dateClosed), soldItems }),
      })
      if (!res.ok) throw new Error()
      onSaved()
    } catch {
      setSaveError(t('canvas.saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-base font-semibold">{t('canvas.modal.closeRun.title')}</h2>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{run.canvasId}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('canvas.modal.closeRun.dateClosed')}</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateClosed}
              onChange={(e) => setDateClosed(e.target.value)}
            />
          </div>

          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">{t('canvas.modal.closeRun.items')}</p>
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 gap-y-1 items-center mb-1">
              <span />
              <span className="text-xs text-gray-400 text-center whitespace-nowrap">{t('canvas.item.brought')}</span>
              <span className="text-xs text-blue-600 text-center whitespace-nowrap">{t('canvas.item.sold')}</span>
              <span className="text-xs text-amber-600 text-center whitespace-nowrap">{t('canvas.item.returned')}</span>
            </div>
            <div className="space-y-2">
              {run.items.map((item) => (
                <div key={item.itemName} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center">
                  <span className="text-sm text-gray-700 truncate">{item.itemName}</span>
                  <span className="text-xs text-gray-500 text-center w-8">{item.quantityBrought}</span>
                  <input
                    type="number"
                    min="0"
                    max={item.quantityBrought}
                    className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    value={soldQtys[item.itemName] ?? ''}
                    onChange={(e) => setSoldQtys({ ...soldQtys, [item.itemName]: e.target.value })}
                  />
                  <input
                    type="number"
                    min="0"
                    max={item.quantityBrought}
                    className="w-20 px-2 py-1.5 border border-amber-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="0"
                    value={returnedQtys[item.itemName] ?? ''}
                    onChange={(e) => setReturnedQtys({ ...returnedQtys, [item.itemName]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>

          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? t('common.saving') : t('canvas.closeRun')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Edit Quantities Modal (for already-closed runs) ─────────────────────────

interface EditQuantitiesModalProps {
  run: CanvasRun
  onClose: () => void
  onSaved: () => void
}

function EditQuantitiesModal({ run, onClose, onSaved }: EditQuantitiesModalProps) {
  const { t } = useLanguage()
  const [soldQtys, setSoldQtys] = useState<Record<string, string>>(
    Object.fromEntries(run.items.map((item) => [
      item.itemName,
      item.quantitySold !== null ? String(item.quantitySold) : '',
    ]))
  )
  const [returnedQtys, setReturnedQtys] = useState<Record<string, string>>(
    Object.fromEntries(run.items.map((item) => [
      item.itemName,
      item.quantityReturned !== null ? String(item.quantityReturned) : '',
    ]))
  )
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    try {
      const soldItems = run.items.map((item) => ({
        itemName:         item.itemName,
        quantitySold:     soldQtys[item.itemName]     || '0',
        quantityReturned: returnedQtys[item.itemName] || '0',
      }))
      const res = await fetch(`/api/canvas/${encodeURIComponent(run.canvasId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateClosed: run.dateClosed, soldItems }),
      })
      if (!res.ok) throw new Error()
      onSaved()
    } catch {
      setSaveError(t('canvas.saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-base font-semibold">Edit Quantities</h2>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{run.canvasId}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 gap-y-1 items-center mb-1">
            <span />
            <span className="text-xs text-gray-400 text-center whitespace-nowrap">{t('canvas.item.brought')}</span>
            <span className="text-xs text-blue-600 text-center whitespace-nowrap">{t('canvas.item.sold')}</span>
            <span className="text-xs text-amber-600 text-center whitespace-nowrap">{t('canvas.item.returned')}</span>
          </div>
          <div className="space-y-2">
            {run.items.map((item) => (
              <div key={item.itemName} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center">
                <span className="text-sm text-gray-700 truncate">{item.itemName}</span>
                <span className="text-xs text-gray-500 text-center w-8">{item.quantityBrought}</span>
                <input
                  type="number"
                  min="0"
                  className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  value={soldQtys[item.itemName] ?? ''}
                  onChange={(e) => setSoldQtys({ ...soldQtys, [item.itemName]: e.target.value })}
                />
                <input
                  type="number"
                  min="0"
                  className="w-20 px-2 py-1.5 border border-amber-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="0"
                  value={returnedQtys[item.itemName] ?? ''}
                  onChange={(e) => setReturnedQtys({ ...returnedQtys, [item.itemName]: e.target.value })}
                />
              </div>
            ))}
          </div>

          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? t('common.saving') : 'Save Quantities'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CanvasPage() {
  const { t } = useLanguage()
  const [openRuns, setOpenRuns] = useState<CanvasRun[]>([])
  const [closedRuns, setClosedRuns] = useState<CanvasRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null)
  const [closedSectionExpanded, setClosedSectionExpanded] = useState(false)
  const [showNewRun, setShowNewRun] = useState(false)
  const [showCloseRun, setShowCloseRun] = useState<CanvasRun | null>(null)
  const [editingRun, setEditingRun] = useState<CanvasRun | null>(null)
  const [editingQtysRun, setEditingQtysRun] = useState<CanvasRun | null>(null)
  const [deletingRun, setDeletingRun] = useState<CanvasRun | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // ─── Search & filter state ────────────────────────────────────────────────
  const [searchScope, setSearchScope] = useState<'all' | 'id' | 'rep'>('all')
  const [searchText, setSearchText] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterStatuses, setFilterStatuses] = useState<Set<string>>(new Set())
  const [filterReps, setFilterReps] = useState<Set<string>>(new Set())
  const [filterMonth, setFilterMonth] = useState('')

  const activeFilterCount = filterStatuses.size + filterReps.size + (filterMonth ? 1 : 0)
  const hasActiveFilters = activeFilterCount > 0 || searchText.trim() !== ''

  function resetAll() {
    setSearchText('')
    setSearchScope('all')
    setFilterStatuses(new Set())
    setFilterReps(new Set())
    setFilterMonth('')
    setShowFilters(false)
  }

  function toggleStatus(s: string) {
    setFilterStatuses((prev) => { const next = new Set(prev); if (next.has(s)) next.delete(s); else next.add(s); return next })
  }

  function toggleRep(r: string) {
    setFilterReps((prev) => { const next = new Set(prev); if (next.has(r)) next.delete(r); else next.add(r); return next })
  }

  const filterRun = useCallback((run: CanvasRun): boolean => {
    const q = searchText.trim().toLowerCase()
    if (q) {
      const pass =
        searchScope === 'id'  ? run.canvasId.toLowerCase().includes(q) :
        searchScope === 'rep' ? run.salesRepName.toLowerCase().includes(q) :
        run.canvasId.toLowerCase().includes(q) || run.salesRepName.toLowerCase().includes(q) || run.dateOut.includes(q)
      if (!pass) return false
    }
    if (filterStatuses.size > 0 && !filterStatuses.has(run.status)) return false
    if (filterReps.size > 0 && !filterReps.has(run.salesRepName)) return false
    if (filterMonth) {
      const [fy, fm] = filterMonth.split('-').map(Number)
      const d = parseDDMMYYYY(run.dateOut)
      if (!(d.getFullYear() === fy && d.getMonth() + 1 === fm)) return false
    }
    return true
  }, [searchText, searchScope, filterStatuses, filterReps, filterMonth])

  const filteredOpenRuns = useMemo(() => openRuns.filter(filterRun), [openRuns, filterRun])
  const filteredClosedRuns = useMemo(() => closedRuns.filter(filterRun), [closedRuns, filterRun])

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setSyncing(true)
    try {
      const res = await fetch('/api/canvas')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setOpenRuns(data.openRuns)
      setClosedRuns(data.closedRuns)
      setError('')
      setLastSynced(new Date())
    } catch {
      setError(t('canvas.error'))
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }, [t])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(), 30_000)
    return () => clearInterval(interval)
  }, [fetchData])

  function handleSaved() {
    setShowNewRun(false)
    setShowCloseRun(null)
    setEditingRun(null)
    setEditingQtysRun(null)
    fetchData(true)
  }

  async function handleDeleteConfirm() {
    if (!deletingRun) return
    setIsDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch(`/api/canvas/${encodeURIComponent(deletingRun.canvasId)}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error()
      setDeletingRun(null)
      fetchData(true)
    } catch {
      setDeleteError(t('canvas.deleteError'))
    } finally {
      setIsDeleting(false)
    }
  }

  function toggleRun(canvasId: string) {
    setExpandedRunId(expandedRunId === canvasId ? null : canvasId)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('canvas.title')}</h1>
          <p className="text-xs text-gray-400 mt-1">
            {t('common.lastSynced')}{' '}
            {lastSynced ? formatTime(lastSynced) : t('common.never')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            disabled={syncing}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-700 disabled:opacity-50 transition-colors"
          >
            {syncing ? t('common.syncing') : t('common.sync')}
          </button>
          <button
            onClick={() => setShowNewRun(true)}
            className="px-4 py-1.5 text-sm font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            + {t('canvas.newRun')}
          </button>
        </div>
      </div>

      {/* Search & filter bar */}
      <div className="mb-6 space-y-2">
        <div className="flex gap-2">
          <div className="flex flex-1 rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
            <select
              className="px-2 py-2 text-xs text-gray-600 bg-gray-50 border-r border-gray-300 focus:outline-none"
              value={searchScope}
              onChange={(e) => setSearchScope(e.target.value as 'all' | 'id' | 'rep')}
            >
              <option value="all">{t('common.allFields')}</option>
              <option value="id">{t('canvas.col.canvasId')}</option>
              <option value="rep">{t('canvas.col.salesRep')}</option>
            </select>
            <input
              className="flex-1 px-3 py-2 text-sm focus:outline-none bg-white"
              placeholder={t('common.search')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText && (
              <button onClick={() => setSearchText('')} className="px-3 text-gray-400 hover:text-gray-600 transition-colors">×</button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 text-sm rounded-lg border transition-colors whitespace-nowrap ${
              showFilters || activeFilterCount > 0
                ? 'border-blue-500 text-blue-700 bg-blue-50'
                : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-700'
            }`}
          >
            {t('common.filter')}{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
          </button>
          {hasActiveFilters && (
            <button
              onClick={resetAll}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-500 hover:text-red-600 hover:border-red-300 transition-colors whitespace-nowrap"
            >
              × {t('common.resetAll')}
            </button>
          )}
        </div>

        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{t('common.status')}</p>
              <div className="flex flex-wrap gap-2">
                {(['Open', 'Closed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      filterStatuses.has(s)
                        ? 'bg-blue-700 text-white border-blue-700'
                        : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-700'
                    }`}
                  >
                    {s === 'Open' ? t('status.open') : t('status.closed')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{t('canvas.col.salesRep')}</p>
              <div className="flex flex-wrap gap-2">
                {SALES_REPS.map((rep) => (
                  <button
                    key={rep}
                    onClick={() => toggleRep(rep)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      filterReps.has(rep)
                        ? 'bg-blue-700 text-white border-blue-700'
                        : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-700'
                    }`}
                  >
                    {rep}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{t('common.month')}</p>
              <input
                type="month"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              />
              {filterMonth && (
                <button onClick={() => setFilterMonth('')} className="ml-2 text-xs text-gray-400 hover:text-red-500 transition-colors">× clear</button>
              )}
            </div>
            <div className="flex justify-end pt-1 border-t border-gray-100">
              <button onClick={resetAll} className="text-xs text-gray-400 hover:text-red-600 transition-colors">
                {t('common.resetFilters')}
              </button>
            </div>
          </div>
        )}
      </div>

      {error ? (
        <div className="flex items-center justify-center py-16 text-red-500 text-sm">{error}</div>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Open Runs section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-base font-semibold text-gray-800">{t('canvas.openRuns')}</h2>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                {filteredOpenRuns.length}{openRuns.length !== filteredOpenRuns.length ? `/${openRuns.length}` : ''}
              </span>
            </div>

            {filteredOpenRuns.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-sm text-gray-400">
                {openRuns.length === 0 ? t('canvas.noOpenRuns') : (
                  <span>{t('common.noResults')}{' '}<button onClick={resetAll} className="text-blue-600 hover:underline">{t('common.resetAll')}</button></span>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOpenRuns.map((run) => (
                  <RunCard
                    key={run.canvasId}
                    run={run}
                    expanded={expandedRunId === run.canvasId}
                    onToggle={() => toggleRun(run.canvasId)}
                    onClose={() => setShowCloseRun(run)}
                    onEdit={() => setEditingRun(run)}
                    onDelete={() => { setDeleteError(''); setDeletingRun(run) }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Closed Runs section (collapsible) */}
          <div>
            <button
              onClick={() => setClosedSectionExpanded(!closedSectionExpanded)}
              className="flex items-center gap-2 mb-3 group"
            >
              <h2 className="text-base font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                {t('canvas.closedRuns')}
              </h2>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                {filteredClosedRuns.length}{closedRuns.length !== filteredClosedRuns.length ? `/${closedRuns.length}` : ''}
              </span>
              <span className="text-gray-400 text-sm">{closedSectionExpanded ? '▲' : '▼'}</span>
            </button>

            {closedSectionExpanded && (
              filteredClosedRuns.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-sm text-gray-400">
                  {closedRuns.length === 0 ? t('canvas.noClosedRuns') : (
                    <span>{t('common.noResults')}{' '}<button onClick={resetAll} className="text-blue-600 hover:underline">{t('common.resetAll')}</button></span>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredClosedRuns.map((run) => (
                    <RunCard
                      key={run.canvasId}
                      run={run}
                      expanded={expandedRunId === run.canvasId}
                      onToggle={() => toggleRun(run.canvasId)}
                      onEditQtys={() => setEditingQtysRun(run)}
                      onEdit={() => setEditingRun(run)}
                      onDelete={() => { setDeleteError(''); setDeletingRun(run) }}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        </>
      )}

      {showNewRun && <NewRunModal onClose={() => setShowNewRun(false)} onSaved={handleSaved} />}
      {showCloseRun && (
        <CloseRunModal
          run={showCloseRun}
          onClose={() => setShowCloseRun(null)}
          onSaved={handleSaved}
        />
      )}
      {editingRun && (
        <EditRunModal
          run={editingRun}
          onClose={() => setEditingRun(null)}
          onSaved={handleSaved}
        />
      )}
      {editingQtysRun && (
        <EditQuantitiesModal
          run={editingQtysRun}
          onClose={() => setEditingQtysRun(null)}
          onSaved={handleSaved}
        />
      )}
      {deletingRun && (
        <DeleteRunModal
          run={deletingRun}
          isDeleting={isDeleting}
          deleteError={deleteError}
          onClose={() => setDeletingRun(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  )
}
