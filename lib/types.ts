export interface InvoiceRow {
  invoiceCode: string
  customerName: string
  invoiceDate: string
  dueDate: string
  totalAmount: string
  rowIndex: number
}

export interface PaymentRow {
  invoiceCode: string
  paymentDate: string
  amountPaid: string
  status: string
}

export interface CanvasRunRow {
  canvasId: string
  salesRepName: string
  dateOut: string
  dateClosed: string
  status: 'Open' | 'Closed'
  rowIndex: number
}

export interface CanvasItemRow {
  canvasId: string
  itemName: string
  quantityBrought: string
  quantityReturned: string
}

export interface Payment {
  invoiceCode: string
  paymentDate: string
  amountPaid: number
  status: string
}

export interface Invoice extends InvoiceRow {
  totalPaid: number
  remaining: number
  status: 'Unpaid' | 'Partial' | 'Paid'
  isOverdue: boolean
  payments: Payment[]
}

export interface CanvasItem {
  canvasId: string
  itemName: string
  quantityBrought: number
  quantityReturned: number | null
  quantitySold: number | null
}

export interface CanvasRun extends CanvasRunRow {
  items: CanvasItem[]
  totalQuantityBrought: number
  totalQuantitySold: number | null
}

export interface ARSummary {
  totalOutstanding: number
  overdueCount: number
  dueSoon7Days: number
}

export interface ReceivablesResponse {
  invoices: Invoice[]
  summary: ARSummary
}

export interface CanvasResponse {
  openRuns: CanvasRun[]
  closedRuns: CanvasRun[]
}
