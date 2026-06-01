'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'
import type { CanvasRun } from '@/lib/types'

function CanvasPrintContent({ id }: { id: string }) {
  const sp      = useSearchParams()
  const preview = sp.get('preview') === '1'
  const { t }   = useLanguage()

  const [run, setRun]             = useState<CanvasRun | null>(null)
  const [loading, setLoading]     = useState(true)
  const [notFound, setNotFound]   = useState(false)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    fetch('/api/canvas')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('fetch failed')))
      .then(data => {
        const found = (data.openRuns as CanvasRun[]).find(r => r.canvasId === id)
        if (found) setRun(found)
        else setNotFound(true)
        setLoading(false)
      })
      .catch(() => { setLoadError(true); setLoading(false) })
  }, [id])

  if (loading) {
    return <div className="p-12 text-center text-gray-400 text-sm">{t('print.canvas.loading')}</div>
  }
  if (loadError) {
    return <div className="p-12 text-center text-red-500 text-sm">{t('print.canvas.loadError')}</div>
  }
  if (notFound || !run) {
    return <div className="p-12 text-center text-red-500 text-sm">{t('print.canvas.notFound')}</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-6 font-sans text-gray-900">

      {/* Controls — hidden when in preview mode or when printing */}
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
          <span className="text-xs text-gray-400 ml-2">
            {t('print.canvas.reviewMsg')}
          </span>
        </div>
      )}

      {/* Run header */}
      <div className="mb-6 border-b-2 border-gray-900 pb-4">
        <h1 className="text-xl font-bold uppercase tracking-widest text-gray-900">{t('print.canvas.title')}</h1>
        <div className="grid grid-cols-2 gap-x-8 mt-3 text-sm">
          <div className="space-y-1.5">
            <p>
              <span className="font-semibold text-gray-500 inline-block w-28">{t('canvas.col.canvasId')}:</span>
              <span className="font-mono font-bold text-gray-900">{run.canvasId}</span>
            </p>
            <p>
              <span className="font-semibold text-gray-500 inline-block w-28">{t('canvas.col.salesRep')}:</span>
              <span className="text-gray-900">{run.salesRepName}</span>
            </p>
          </div>
          <div className="space-y-1.5">
            <p>
              <span className="font-semibold text-gray-500 inline-block w-28">{t('canvas.col.dateOut')}:</span>
              <span className="text-gray-900">{run.dateOut}</span>
            </p>
            <p>
              <span className="font-semibold text-gray-500 inline-block w-28">{t('print.canvas.totalItems')}:</span>
              <span className="text-gray-900">{run.items.length} item{run.items.length !== 1 ? 's' : ''}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Items table */}
      <table className="w-full text-xs border-collapse mb-10">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 px-2 py-2 text-center font-semibold w-8">No.</th>
            <th className="border border-gray-400 px-2 py-2 text-left font-semibold">{t('print.canvas.itemCode')}</th>
            <th className="border border-gray-400 px-2 py-2 text-left font-semibold">{t('print.canvas.partNo')}</th>
            <th className="border border-gray-400 px-2 py-2 text-left font-semibold">{t('canvas.item.name')}</th>
            <th className="border border-gray-400 px-2 py-2 text-left font-semibold">{t('print.canvas.brand')}</th>
            <th className="border border-gray-400 px-2 py-2 text-center font-semibold">{t('canvas.item.brought')}</th>
            <th className="border border-gray-400 px-2 py-2 text-center font-semibold w-20">{t('canvas.item.sold')}</th>
            <th className="border border-gray-400 px-2 py-2 text-center font-semibold w-20">{t('canvas.item.returned')}</th>
          </tr>
        </thead>
        <tbody>
          {run.items.map((item, i) => (
            <tr key={i} className="even:bg-gray-50">
              <td className="border border-gray-300 px-2 py-2 text-center text-gray-500">{i + 1}</td>
              <td className="border border-gray-300 px-2 py-2 font-mono">{item.itemCode || '—'}</td>
              <td className="border border-gray-300 px-2 py-2 font-mono">{item.partNumber || '—'}</td>
              <td className="border border-gray-300 px-2 py-2 font-medium">{item.itemName}</td>
              <td className="border border-gray-300 px-2 py-2 text-gray-600">{item.brand || '—'}</td>
              <td className="border border-gray-300 px-2 py-2 text-center font-bold">{item.quantityBrought}</td>
              <td className="border border-gray-300 px-2 py-3 text-center text-gray-300 text-base tracking-widest">______</td>
              <td className="border border-gray-300 px-2 py-3 text-center text-gray-300 text-base tracking-widest">______</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-semibold">
            <td className="border border-gray-400 px-2 py-2 text-center" colSpan={5}>{t('print.canvas.total')}</td>
            <td className="border border-gray-400 px-2 py-2 text-center font-bold">{run.totalQuantityBrought}</td>
            <td className="border border-gray-400 px-2 py-3 text-center text-gray-300 text-base tracking-widest">______</td>
            <td className="border border-gray-400 px-2 py-3 text-center text-gray-300 text-base tracking-widest">______</td>
          </tr>
        </tfoot>
      </table>

      {/* Signature area */}
      <div className="mt-12 grid grid-cols-2 gap-16">
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-6">{t('canvas.col.salesRep')}</p>
          <div className="border-b border-gray-500 mb-2" />
          <p className="text-xs text-gray-400">{t('print.canvas.sigName')} _______________________ &nbsp; {t('print.canvas.sigDate')} _____________</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-6">{t('print.canvas.sigReceived')}</p>
          <div className="border-b border-gray-500 mb-2" />
          <p className="text-xs text-gray-400">{t('print.canvas.sigName')} _______________________ &nbsp; {t('print.canvas.sigDate')} _____________</p>
        </div>
      </div>
    </div>
  )
}

export default function CanvasPrintPage() {
  const params = useParams()
  const id = params.id as string
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-400 text-sm">Loading…</div>}>
      <CanvasPrintContent id={id} />
    </Suspense>
  )
}
