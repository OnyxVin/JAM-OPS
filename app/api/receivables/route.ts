import { NextRequest, NextResponse } from 'next/server'
import { getAllInvoices, getAllPayments, createInvoice, getNextInvoiceCode } from '@/lib/sheets'
import type { Invoice, Payment, ARSummary, ReceivablesResponse } from '@/lib/types'

function parseDDMMYYYY(s: string): Date {
  if (!s) return new Date(0)
  const parts = s.trim().split('/')
  if (parts.length !== 3) return new Date(0)
  let [d, m, y] = parts.map(Number)
  if (!d || !m || !y) return new Date(0)
  // Handle MM/DD/YYYY (US format returned by some sheet locales): if month > 12, swap
  if (m > 12 && d <= 12) { const tmp = d; d = m; m = tmp }
  if (m < 1 || m > 12 || d < 1 || d > 31) return new Date(0)
  return new Date(y, m - 1, d)
}

function safeParseFloat(s: string | number | undefined): number {
  if (s == null) return 0
  return parseFloat(String(s).trim().replace(/,/g, '')) || 0
}

export async function GET() {
  try {
    const [invoiceRows, paymentRows] = await Promise.all([
      getAllInvoices(),
      getAllPayments(),
    ])

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const in7Days = new Date(today)
    in7Days.setDate(in7Days.getDate() + 7)

    const invoices: Invoice[] = invoiceRows.map((inv) => {
      const matchingPayments = paymentRows
        .filter((p) => p.invoiceCode === inv.invoiceCode)
        .map<Payment>((p) => ({
          invoiceCode: p.invoiceCode,
          paymentDate: p.paymentDate,
          amountPaid: safeParseFloat(p.amountPaid),
          status: p.status,
        }))

      const totalAmount = safeParseFloat(inv.totalAmount)
      const totalPaid = matchingPayments.reduce((sum, p) => sum + p.amountPaid, 0)
      const remaining = Math.max(0, totalAmount - totalPaid)

      let status: Invoice['status']
      if (totalAmount > 0 && remaining < 0.005) status = 'Paid'
      else if (totalPaid > 0) status = 'Partial'
      else status = 'Unpaid'

      const dueDate = parseDDMMYYYY(inv.dueDate)
      const isOverdue = status !== 'Paid' && dueDate < today

      return {
        ...inv,
        totalPaid,
        remaining,
        status,
        isOverdue,
        payments: matchingPayments,
      }
    })

    const summary: ARSummary = {
      totalOutstanding: invoices
        .filter((inv) => inv.status !== 'Paid')
        .reduce((sum, inv) => sum + inv.remaining, 0),
      overdueCount: invoices.filter((inv) => inv.isOverdue).length,
      dueSoon7Days: invoices.filter((inv) => {
        if (inv.status === 'Paid' || inv.isOverdue) return false
        const due = parseDDMMYYYY(inv.dueDate)
        return due >= today && due <= in7Days
      }).length,
    }

    const response: ReceivablesResponse = { invoices, summary }
    return NextResponse.json(response)
  } catch (error) {
    console.error('[GET /api/receivables]', error)
    return NextResponse.json({ error: 'Failed to load invoices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, invoiceDate, dueDate, totalAmount } = body
    const invoiceCodeFromBody = body.invoiceCode ? String(body.invoiceCode).trim() : ''

    if (!customerName || !invoiceDate || !dueDate || !totalAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const invoiceCode = invoiceCodeFromBody || await getNextInvoiceCode(String(invoiceDate))

    await createInvoice({
      invoiceCode,
      customerName: String(customerName),
      invoiceDate: String(invoiceDate),
      dueDate: String(dueDate),
      totalAmount: String(totalAmount),
    })

    return NextResponse.json({ success: true, invoiceCode }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/receivables]', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
