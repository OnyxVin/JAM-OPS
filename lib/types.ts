export interface InvoiceRow {
  invoiceCode: string
  invoiceDate: string
  dueDate: string
  customerName: string
  address: string
  discount: string
  totalAmount: string
  status: string
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
  itemCode: string
  partNumber: string
  itemName: string
  brand: string
  quantityBrought: string
  quantitySold: string
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
  netAmount: number
  status: 'Unpaid' | 'Partial' | 'Paid'
  isOverdue: boolean
  payments: Payment[]
}

export interface CanvasItem {
  canvasId: string
  itemCode: string
  partNumber: string
  itemName: string
  brand: string
  quantityBrought: number
  quantitySold: number | null
  quantityReturned: number | null
}

export interface CanvasRun extends CanvasRunRow {
  items: CanvasItem[]
  totalQuantityBrought: number
  totalQuantitySold: number | null
  totalQuantityReturned: number | null
}

export interface InventoryItem {
  id: number
  itemCode: string
  partNumber: string
  itemName: string
  brand: string
  basePrice: number
  sellingPrice: number
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
