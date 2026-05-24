import { NextRequest, NextResponse } from 'next/server'
import {
  getAllInvoices,
  updateInvoice,
  getAllPayments,
  createPayment,
  updateInvoiceStatus,
  deleteInvoice,
  deletePaymentsByInvoice,
} from '@/lib/sheets'

type Params = { params: { id: string } }

// PATCH /api/receivables/[id] — update invoice details
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const invoiceCode = params.id
    const body = await request.json()

    const invoices = await getAllInvoices()
    const invoice = invoices.find((inv) => inv.invoiceCode === invoiceCode)
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    await updateInvoice(invoice.rowIndex, {
      invoiceCode:  body.invoiceCode  ?? invoice.invoiceCode,
      invoiceDate:  body.invoiceDate  ?? invoice.invoiceDate,
      dueDate:      body.dueDate      ?? invoice.dueDate,
      customerName: body.customerName ?? invoice.customerName,
      address:      body.address      !== undefined ? String(body.address)  : invoice.address,
      discount:     body.discount     !== undefined ? String(body.discount) : invoice.discount,
      totalAmount:  body.totalAmount  ?? invoice.totalAmount,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PATCH /api/receivables/[id]]', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

// POST /api/receivables/[id] — add a payment for this invoice
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const invoiceCode = params.id
    const body = await request.json()
    const { paymentDate, amountPaid } = body

    if (!paymentDate || !amountPaid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Compute new invoice status after this payment
    const [invoices, existingPayments] = await Promise.all([
      getAllInvoices(),
      getAllPayments(),
    ])

    const invoice = invoices.find((inv) => inv.invoiceCode === invoiceCode)
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const safeFloat = (v: string | number | undefined) =>
      parseFloat(String(v ?? '').trim().replace(/,/g, '')) || 0

    const existingTotal = existingPayments
      .filter((p) => p.invoiceCode === invoiceCode)
      .reduce((sum, p) => sum + safeFloat(p.amountPaid), 0)

    const newTotal = existingTotal + safeFloat(String(amountPaid))
    const invoiceTotal = safeFloat(invoice.totalAmount)
    const discount = safeFloat(invoice.discount)
    const netTotal = invoiceTotal * (1 - discount / 100)
    const remaining = Math.max(0, netTotal - newTotal)

    let newStatus: 'Unpaid' | 'Partial' | 'Paid'
    if (netTotal > 0 && remaining < 0.005) newStatus = 'Paid'
    else if (newTotal > 0) newStatus = 'Partial'
    else newStatus = 'Unpaid'

    // Write payment row and update invoice status in parallel
    await Promise.all([
      createPayment({
        invoiceCode,
        paymentDate: String(paymentDate),
        amountPaid: String(amountPaid),
        status: newStatus,
      }),
      updateInvoiceStatus(invoice.rowIndex, newStatus),
    ])

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/receivables/[id]]', error)
    return NextResponse.json({ error: 'Failed to add payment' }, { status: 500 })
  }
}

// DELETE /api/receivables/[id] — delete invoice and all its payments
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const invoiceCode = params.id
    const invoices = await getAllInvoices()
    const invoice = invoices.find((inv) => inv.invoiceCode === invoiceCode)
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    await Promise.all([
      deletePaymentsByInvoice(invoiceCode),
      deleteInvoice(invoice.rowIndex),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/receivables/[id]]', error)
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}
