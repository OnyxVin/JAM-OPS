'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'
import type { CanvasRun } from '@/lib/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayDMY(): string {
  const d = new Date()
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
}

function fmtDate(yyyymmdd: string): string {
  if (!yyyymmdd) return ''
  const [y, m, d] = yyyymmdd.split('-')
  return `${d}/${m}/${y}`
}

// dateStr = "DD/MM/YYYY", from/to = "YYYY-MM-DD"
function inRange(dateStr: string, from: string, to: string): boolean {
  if (!dateStr || !from || !to) return false
  const parts = dateStr.split('/')
  if (parts.length !== 3) return false
  const [dd, mm, yyyy] = parts
  const dateVal = parseInt(yyyy) * 10000 + parseInt(mm) * 100 + parseInt(dd)
  const [fy, fm, fd] = from.split('-').map(Number)
  const [ty, tm, td] = to.split('-').map(Number)
  const fromVal = fy * 10000 + fm * 100 + fd
  const toVal   = ty * 10000 + tm * 100 + td
  return dateVal >= fromVal && dateVal <= toVal
}

// ─── Print content ─────────────────────────────────────────────────────────────

function CanvasPrintContent() {
  const sp      = useSearchParams()
  const from    = sp.get('from')    ?? ''
  const to      = sp.get('to')      ?? ''
  const preview = sp.get('preview') === '1'
  const sections = new Set((sp.get('sections') ?? 'runs,items,customers').split(',').filter(Boolean))

  const { t } = useLanguage()
  const [runs, setRuns]         = useState<CanvasRun[]>([])
  const [loading, setLoading]   = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    fetch('/api/canvas')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const all: CanvasRun[] = [...(data.openRuns ?? []), ...(data.closedRuns ?? [])]
        setRuns(all)
        setLoading(false)
      })
      .catch(() => { setLoadError(true); setLoading(false) })
  }, [])

  if (loading) return <div className="p-12 text-center text-gray-400 text-sm">{t('print.canvas.report.loading')}</div>
  if (loadError) return <div className="p-12 text-center text-red-500 text-sm">{t('print.canvas.report.loadError')}</div>

  // Only closed runs whose dateClosed falls in range
  const filteredRuns = runs.filter(r => r.status === 'Closed' && inRange(r.dateClosed, from, to))

  const periodLabel = from && to ? `${fmtDate(from)} – ${fmtDate(to)}` : '—'

  // Items sold aggregate: itemName → { brand, totalSold }
  const itemTotals: Record<string, { brand: string; totalSold: number }> = {}
  for (const run of filteredRuns) {
    for (const item of run.items) {
      if (!itemTotals[item.itemName]) itemTotals[item.itemName] = { brand: item.brand, totalSold: 0 }
      itemTotals[item.itemName].totalSold += item.quantitySold ?? 0
    }
  }

  // Customer breakdown: flat list of { customerName, itemName, quantity, canvasId }
  type SaleRow = { customerName: string; itemName: string; quantity: number; canvasId: string }
  const saleRows: SaleRow[] = []
  for (const run of filteredRuns) {
    for (const item of run.items) {
      for (const cs of item.customerSales) {
        saleRows.push({ customerName: cs.customerName, itemName: item.itemName, quantity: cs.quantity, canvasId: run.canvasId })
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-6 font-sans text-gray-900">

      {/* Controls */}
      {!preview && (
        <div className="print:hidden flex items-center gap-3 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-sm font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            {t('print.btn.print')}
          </button>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {t('print.btn.close')}
          </button>
          <span className="text-xs text-gray-400 ml-2">{t('print.canvas.report.reviewMsg')}</span>
        </div>
      )}

      {/* Report header */}
      <div className="mb-8 border-b-2 border-gray-900 pb-4">
        <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide">{t('print.canvas.report.title')}</h1>
        <div className="flex gap-6 mt-2 text-sm text-gray-600">
          <span>{t('print.ar.period')} <span className="font-semibold text-gray-800">{periodLabel}</span></span>
          <span>{t('print.ar.generated')} <span className="font-semibold text-gray-800">{todayDMY()}</span></span>
        </div>
      </div>

      {/* Section: Runs */}
      {sections.has('runs') && (
        <div className="mb-10">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b-2 border-gray-800 pb-1 mb-3">
            {t('print.canvas.report.runsSection')}
          </h2>
          {filteredRuns.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-2">{t('print.canvas.report.noRuns')}</p>
          ) : (
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-2 py-1.5 text-left font-semibold">{t('print.canvas.report.col.canvasId')}</th>
                  <th className="border border-gray-400 px-2 py-1.5 text-left font-semibold">{t('print.canvas.report.col.salesRep')}</th>
                  <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold">{t('print.canvas.report.col.dateOut')}</th>
                  <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold">{t('print.canvas.report.col.dateClosed')}</th>
                  <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold">{t('print.canvas.report.col.items')}</th>
                  <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold">{t('print.canvas.report.col.totalSold')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRuns.map(run => (
                  <tr key={run.canvasId} className="even:bg-gray-50">
                    <td className="border border-gray-200 px-2 py-1.5 font-mono">{run.canvasId}</td>
                    <td className="border border-gray-200 px-2 py-1.5">{run.salesRepName}</td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center">{run.dateOut}</td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center">{run.dateClosed}</td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center">{run.items.length}</td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center font-semibold">{run.totalQuantitySold ?? 0}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-200 font-semibold">
                  <td className="border border-gray-400 px-2 py-1.5" colSpan={4}>
                    {filteredRuns.length} run{filteredRuns.length !== 1 ? 's' : ''}
                  </td>
                  <td className="border border-gray-400 px-2 py-1.5 text-center">
                    {filteredRuns.reduce((s, r) => s + r.items.length, 0)}
                  </td>
                  <td className="border border-gray-400 px-2 py-1.5 text-center">
                    {filteredRuns.reduce((s, r) => s + (r.totalQuantitySold ?? 0), 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}

      {/* Section: Items sold */}
      {sections.has('items') && (
        <div className="mb-10">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b-2 border-gray-800 pb-1 mb-3">
            {t('print.canvas.report.itemsSection')}
          </h2>
          {Object.keys(itemTotals).length === 0 ? (
            <p className="text-xs text-gray-400 italic py-2">{t('print.canvas.report.noItems')}</p>
          ) : (
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-2 py-1.5 text-left font-semibold">{t('print.canvas.report.col.item')}</th>
                  <th className="border border-gray-400 px-2 py-1.5 text-left font-semibold">{t('print.canvas.report.col.brand')}</th>
                  <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold">{t('print.canvas.report.col.totalSold')}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(itemTotals).sort((a, b) => b[1].totalSold - a[1].totalSold).map(([name, info]) => (
                  <tr key={name} className="even:bg-gray-50">
                    <td className="border border-gray-200 px-2 py-1.5">{name}</td>
                    <td className="border border-gray-200 px-2 py-1.5 text-gray-500">{info.brand || '—'}</td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center font-semibold">{info.totalSold}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-200 font-semibold">
                  <td className="border border-gray-400 px-2 py-1.5" colSpan={2}>
                    {Object.keys(itemTotals).length} item{Object.keys(itemTotals).length !== 1 ? 's' : ''}
                  </td>
                  <td className="border border-gray-400 px-2 py-1.5 text-center">
                    {Object.values(itemTotals).reduce((s, i) => s + i.totalSold, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}

      {/* Section: Customer breakdown */}
      {sections.has('customers') && (
        <div className="mb-10">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b-2 border-gray-800 pb-1 mb-3">
            {t('print.canvas.report.custSection')}
          </h2>
          {saleRows.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-2">{t('print.canvas.report.noCust')}</p>
          ) : (
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-2 py-1.5 text-left font-semibold">{t('print.canvas.report.col.customer')}</th>
                  <th className="border border-gray-400 px-2 py-1.5 text-left font-semibold">{t('print.canvas.report.col.item')}</th>
                  <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold">{t('print.canvas.report.col.qty')}</th>
                  <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold">{t('print.canvas.report.col.canvasId')}</th>
                </tr>
              </thead>
              <tbody>
                {saleRows.map((row, i) => (
                  <tr key={i} className="even:bg-gray-50">
                    <td className="border border-gray-200 px-2 py-1.5 font-medium">{row.customerName}</td>
                    <td className="border border-gray-200 px-2 py-1.5">{row.itemName}</td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center font-semibold">{row.quantity}</td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center font-mono text-gray-500">{row.canvasId}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-200 font-semibold">
                  <td className="border border-gray-400 px-2 py-1.5" colSpan={2}>
                    {saleRows.length} sale{saleRows.length !== 1 ? 's' : ''}
                  </td>
                  <td className="border border-gray-400 px-2 py-1.5 text-center">
                    {saleRows.reduce((s, r) => s + r.quantity, 0)}
                  </td>
                  <td className="border border-gray-400 px-2 py-1.5" />
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CanvasPrintReportPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-400 text-sm">Loading…</div>}>
      <CanvasPrintContent />
    </Suspense>
  )
}
