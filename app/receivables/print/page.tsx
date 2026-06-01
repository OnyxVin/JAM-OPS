'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Invoice } from '@/lib/types'

function fmt(n: number): string {
  return 'Rp ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function inMonth(dateStr: string, month: string): boolean {
  if (!dateStr || !month) return false
  const parts = dateStr.split('/')
  if (parts.length !== 3) return false
  const [, mm, yyyy] = parts
  const [y, m] = month.split('-')
  return yyyy === y && mm === m.padStart(2, '0')
}

function monthLabel(month: string): string {
  if (!month) return 'Unknown Period'
  const [y, m] = month.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' })
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
  month: string
  showDateCol: 'dueDate' | 'invoiceDate' | 'lastPayment'
  dateLabel: string
}

function SectionTable({ title, data, month, showDateCol, dateLabel }: SectionTableProps) {
  const totalNet       = data.reduce((s, i) => s + i.netAmount, 0)
  const totalPaid      = data.reduce((s, i) => s + i.totalPaid, 0)
  const totalRemaining = data.reduce((s, i) => s + i.remaining, 0)

  return (
    <div className="mb-10">
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b-2 border-gray-800 pb-1 mb-3">
        {title}
      </h2>
      {data.length === 0 ? (
        <p className="text-xs text-gray-400 italic py-2">No invoices found for this period.</p>
      ) : (
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-2 py-1.5 text-left font-semibold">Invoice Code</th>
              <th className="border border-gray-400 px-2 py-1.5 text-left font-semibold">Customer</th>
              <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold">{dateLabel}</th>
              <th className="border border-gray-400 px-2 py-1.5 text-right font-semibold">Net Total</th>
              <th className="border border-gray-400 px-2 py-1.5 text-right font-semibold">Paid</th>
              <th className="border border-gray-400 px-2 py-1.5 text-right font-semibold">Remaining</th>
              <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map(inv => {
              let dateVal: string
              if (showDateCol === 'lastPayment') {
                const pmts = inv.payments.filter(p => inMonth(p.paymentDate, month))
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
  const month    = sp.get('month') ?? ''
  const sections = new Set((sp.get('sections') ?? 'due,issued,paid').split(',').filter(Boolean))

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    fetch('/api/receivables')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('fetch failed')))
      .then(data => { setInvoices(data.invoices ?? []); setLoading(false) })
      .catch(() => { setError('Failed to load data. Please close and try again.'); setLoading(false) })
  }, [])

  if (loading) {
    return <div className="p-12 text-center text-gray-400 text-sm">Loading report…</div>
  }
  if (error) {
    return <div className="p-12 text-center text-red-500 text-sm">{error}</div>
  }

  const dueInvoices    = sections.has('due')    ? invoices.filter(inv => inMonth(inv.dueDate, month))        : []
  const issuedInvoices = sections.has('issued') ? invoices.filter(inv => inMonth(inv.invoiceDate, month))    : []
  const paidInvoices   = sections.has('paid')   ? invoices.filter(inv => inv.payments.some(p => inMonth(p.paymentDate, month))) : []

  return (
    <div className="max-w-5xl mx-auto px-8 py-6 font-sans text-gray-900">

      {/* Controls — hidden when printing */}
      <div className="print:hidden flex items-center gap-3 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 text-sm font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
        >
          🖨 Print
        </button>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
        >
          ← Close
        </button>
        <span className="text-xs text-gray-400 ml-2">
          Review the report below before printing.
        </span>
      </div>

      {/* Report header */}
      <div className="mb-8 border-b-2 border-gray-900 pb-4">
        <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
          JAM OPS — Accounts Receivable Report
        </h1>
        <div className="flex gap-6 mt-2 text-sm text-gray-600">
          <span>Period: <span className="font-semibold text-gray-800">{monthLabel(month)}</span></span>
          <span>Generated: <span className="font-semibold text-gray-800">{todayDMY()}</span></span>
          <span>Sections: <span className="font-semibold text-gray-800">{Array.from(sections).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}</span></span>
        </div>
      </div>

      {sections.has('due') && (
        <SectionTable
          title="Invoices Due This Month"
          data={dueInvoices}
          month={month}
          showDateCol="dueDate"
          dateLabel="Due Date"
        />
      )}
      {sections.has('issued') && (
        <SectionTable
          title="Invoices Issued This Month"
          data={issuedInvoices}
          month={month}
          showDateCol="invoiceDate"
          dateLabel="Invoice Date"
        />
      )}
      {sections.has('paid') && (
        <SectionTable
          title="Invoices Paid This Month"
          data={paidInvoices}
          month={month}
          showDateCol="lastPayment"
          dateLabel="Payment Date"
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
