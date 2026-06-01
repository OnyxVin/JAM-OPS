'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'
import type { Invoice } from '@/lib/types'

function fmt(n: number): string {
  return 'Rp ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
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

// "YYYY-MM-DD" → "DD/MM/YYYY"
function fmtDate(yyyymmdd: string): string {
  if (!yyyymmdd) return ''
  const [y, m, d] = yyyymmdd.split('-')
  return `${d}/${m}/${y}`
}

function todayDMY(): string {
  const d = new Date()
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
}

function statusLabel(inv: Invoice): string {
  if (inv.isOverdue) return 'Overdue'
  return inv.status
}

// ─── Section table ─────────────────────────────────────────────────────────────

interface SectionTableProps {
  title: string
  data: Invoice[]
  from: string
  to: string
  showDateCol: 'dueDate' | 'invoiceDate' | 'lastPayment'
  dateLabel: string
  noInvoicesLabel: string
  invoiceCodeLabel: string
  customerLabel: string
  netTotalLabel: string
  paidLabel: string
  remainingLabel: string
  statusLabel: string
}

function SectionTable({
  title, data, from, to, showDateCol, dateLabel,
  noInvoicesLabel, invoiceCodeLabel, customerLabel,
  netTotalLabel, paidLabel, remainingLabel, statusLabel: statusCol,
}: SectionTableProps) {
  const totalNet       = data.reduce((s, i) => s + i.netAmount, 0)
  const totalPaid      = data.reduce((s, i) => s + i.totalPaid, 0)
  const totalRemaining = data.reduce((s, i) => s + i.remaining, 0)

  return (
    <div className="mb-10">
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b-2 border-gray-800 pb-1 mb-3">
        {title}
      </h2>
      {data.length === 0 ? (
        <p className="text-xs text-gray-400 italic py-2">{noInvoicesLabel}</p>
      ) : (
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-2 py-1.5 text-left font-semibold">{invoiceCodeLabel}</th>
              <th className="border border-gray-400 px-2 py-1.5 text-left font-semibold">{customerLabel}</th>
              <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold">{dateLabel}</th>
              <th className="border border-gray-400 px-2 py-1.5 text-right font-semibold">{netTotalLabel}</th>
              <th className="border border-gray-400 px-2 py-1.5 text-right font-semibold">{paidLabel}</th>
              <th className="border border-gray-400 px-2 py-1.5 text-right font-semibold">{remainingLabel}</th>
              <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold">{statusCol}</th>
            </tr>
          </thead>
          <tbody>
            {data.map(inv => {
              let dateVal: string
              if (showDateCol === 'lastPayment') {
                const pmts = inv.payments.filter(p => inRange(p.paymentDate, from, to))
                dateVal = pmts.length > 0 ? pmts[pmts.length - 1].paymentDate : '—'
              } else {
                dateVal = inv[showDateCol]
              }
              return (
                <tr key={inv.invoiceCode} className="even:bg-gray-50">
                  <td className="border border-gray-200 px-2 py-1.5 font-mono">{inv.invoiceCode}</td>
                  <td className="border border-gray-200 px-2 py-1.5">{inv.customerName}</td>
                  <td className="border border-gray-200 px-2 py-1.5 text-center">{dateVal}</td>
                  <td className="border border-gray-200 px-2 py-1.5 text-right">{fmt(inv.netAmount)}</td>
                  <td className="border border-gray-200 px-2 py-1.5 text-right">{fmt(inv.totalPaid)}</td>
                  <td className="border border-gray-200 px-2 py-1.5 text-right font-semibold">{fmt(inv.remaining)}</td>
                  <td className="border border-gray-200 px-2 py-1.5 text-center">{statusLabel(inv)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-200 font-semibold">
              <td className="border border-gray-400 px-2 py-1.5" colSpan={3}>
                {data.length} invoice{data.length !== 1 ? 's' : ''}
              </td>
              <td className="border border-gray-400 px-2 py-1.5 text-right">{fmt(totalNet)}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-right">{fmt(totalPaid)}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-right">{fmt(totalRemaining)}</td>
              <td className="border border-gray-400 px-2 py-1.5" />
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  )
}

// ─── Print content ─────────────────────────────────────────────────────────────

function PrintContent() {
  const sp       = useSearchParams()
  const from     = sp.get('from') ?? ''
  const to       = sp.get('to')   ?? ''
  const sections = new Set((sp.get('sections') ?? 'due,issued,paid').split(',').filter(Boolean))

  const { t } = useLanguage()

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading]   = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    fetch('/api/receivables')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('fetch failed')))
      .then(data => { setInvoices(data.invoices ?? []); setLoading(false) })
      .catch(() => { setLoadError(true); setLoading(false) })
  }, [])

  if (loading) {
    return <div className="p-12 text-center text-gray-400 text-sm">{t('print.ar.loading')}</div>
  }
  if (loadError) {
    return <div className="p-12 text-center text-red-500 text-sm">{t('print.ar.loadError')}</div>
  }

  const dueInvoices    = sections.has('due')    ? invoices.filter(inv => inRange(inv.dueDate, from, to))       : []
  const issuedInvoices = sections.has('issued') ? invoices.filter(inv => inRange(inv.invoiceDate, from, to))   : []
  const paidInvoices   = sections.has('paid')   ? invoices.filter(inv => inv.payments.some(p => inRange(p.paymentDate, from, to))) : []

  const periodLabel = from && to ? `${fmtDate(from)} – ${fmtDate(to)}` : '—'

  const sectionNames: Record<string, string> = {
    due:    t('print.ar.dueSection'),
    issued: t('print.ar.issuedSection'),
    paid:   t('print.ar.paidSection'),
  }

  const tableProps = {
    noInvoicesLabel:  t('print.ar.noInvoices'),
    invoiceCodeLabel: t('ar.col.invoiceCode'),
    customerLabel:    t('ar.col.customer'),
    netTotalLabel:    t('ar.col.total'),
    paidLabel:        t('ar.col.paid'),
    remainingLabel:   t('ar.col.remaining'),
    statusLabel:      t('ar.col.status'),
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-6 font-sans text-gray-900">

      {/* Controls — hidden when printing */}
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
          {t('print.ar.reviewMsg')}
        </span>
      </div>

      {/* Report header */}
      <div className="mb-8 border-b-2 border-gray-900 pb-4">
        <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
          {t('print.ar.reportTitle')}
        </h1>
        <div className="flex gap-6 mt-2 text-sm text-gray-600">
          <span>{t('print.ar.period')} <span className="font-semibold text-gray-800">{periodLabel}</span></span>
          <span>{t('print.ar.generated')} <span className="font-semibold text-gray-800">{todayDMY()}</span></span>
          <span>{t('print.ar.sections')} <span className="font-semibold text-gray-800">{Array.from(sections).map(s => sectionNames[s] ?? s).join(', ')}</span></span>
        </div>
      </div>

      {sections.has('due') && (
        <SectionTable
          title={t('print.ar.dueSection')}
          data={dueInvoices}
          from={from}
          to={to}
          showDateCol="dueDate"
          dateLabel={t('ar.col.dueDate')}
          {...tableProps}
        />
      )}
      {sections.has('issued') && (
        <SectionTable
          title={t('print.ar.issuedSection')}
          data={issuedInvoices}
          from={from}
          to={to}
          showDateCol="invoiceDate"
          dateLabel={t('ar.col.invoiceDate')}
          {...tableProps}
        />
      )}
      {sections.has('paid') && (
        <SectionTable
          title={t('print.ar.paidSection')}
          data={paidInvoices}
          from={from}
          to={to}
          showDateCol="lastPayment"
          dateLabel={t('print.ar.paymentDate')}
          {...tableProps}
        />
      )}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ARPrintPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-400 text-sm">Loading…</div>}>
      <PrintContent />
    </Suspense>
  )
}
