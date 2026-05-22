import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import type { InvoiceRow, PaymentRow, CanvasRunRow, CanvasItemRow } from './types'

const SHEET_ID_AR_INVOICES = process.env.GOOGLE_SHEET_ID_AR_INVOICES!
const SHEET_ID_AR_PAYMENTS = process.env.GOOGLE_SHEET_ID_AR_PAYMENTS!
const SHEET_ID_CANVAS_RUNS = process.env.GOOGLE_SHEET_ID_CANVAS_RUNS!
const SHEET_ID_CANVAS_ITEMS = process.env.GOOGLE_SHEET_ID_CANVAS_ITEMS!

const TAB_AR_INVOICES = process.env.GOOGLE_TAB_AR_INVOICES ?? 'Sheet1'
const TAB_AR_PAYMENTS = process.env.GOOGLE_TAB_AR_PAYMENTS ?? 'Sheet1'
const TAB_CANVAS_RUNS = process.env.GOOGLE_TAB_CANVAS_RUNS ?? 'Sheet1'
const TAB_CANVAS_ITEMS = process.env.GOOGLE_TAB_CANVAS_ITEMS ?? 'Sheet1'

// Singleton with dev-mode global to survive hot reload
const globalForSheets = global as typeof global & { oauth2Client?: OAuth2Client }

function getOAuth2Client(): OAuth2Client {
  if (globalForSheets.oauth2Client) return globalForSheets.oauth2Client

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    'https://oauth2.googleapis.com/token'
  )

  client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForSheets.oauth2Client = client
  }

  return client
}

function getSheetsAPI() {
  return google.sheets({ version: 'v4', auth: getOAuth2Client() })
}

// ─── Low-level helpers ────────────────────────────────────────────────────────

async function getSheetValues(spreadsheetId: string, tabName: string): Promise<string[][]> {
  const sheets = getSheetsAPI()
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: tabName,
  })
  return (response.data.values ?? []) as string[][]
}

async function appendRow(
  spreadsheetId: string,
  tabName: string,
  row: (string | number)[]
): Promise<void> {
  const sheets = getSheetsAPI()
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: tabName,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  })
}

async function updateRow(
  spreadsheetId: string,
  tabName: string,
  sheetRowNumber: number,
  row: (string | number)[]
): Promise<void> {
  const sheets = getSheetsAPI()
  const range = `${tabName}!A${sheetRowNumber}`
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  })
}

// ─── AR_Invoices ──────────────────────────────────────────────────────────────

export async function getAllInvoices(): Promise<InvoiceRow[]> {
  const rows = await getSheetValues(SHEET_ID_AR_INVOICES, TAB_AR_INVOICES)
  return rows.slice(1).map((row, index) => ({
    invoiceCode:  row[0] ?? '',
    customerName: row[1] ?? '',
    invoiceDate:  row[2] ?? '',
    dueDate:      row[3] ?? '',
    totalAmount:  row[4] ?? '0',
    rowIndex:     index + 2,
  })).filter(r => r.invoiceCode !== '')
}

export async function createInvoice(data: {
  invoiceCode: string
  customerName: string
  invoiceDate: string
  dueDate: string
  totalAmount: string
}): Promise<void> {
  await appendRow(SHEET_ID_AR_INVOICES, TAB_AR_INVOICES, [
    data.invoiceCode,
    data.customerName,
    data.invoiceDate,
    data.dueDate,
    data.totalAmount,
    'Unpaid',
  ])
}

export async function updateInvoice(
  rowIndex: number,
  data: Partial<Omit<InvoiceRow, 'rowIndex'>>
): Promise<void> {
  const rows = await getSheetValues(SHEET_ID_AR_INVOICES, TAB_AR_INVOICES)
  const dataRows = rows.slice(1)
  const existing = dataRows.find((_, i) => i + 2 === rowIndex)
  if (!existing) throw new Error(`Invoice row ${rowIndex} not found`)

  await updateRow(SHEET_ID_AR_INVOICES, TAB_AR_INVOICES, rowIndex, [
    data.invoiceCode  ?? existing[0] ?? '',
    data.customerName ?? existing[1] ?? '',
    data.invoiceDate  ?? existing[2] ?? '',
    data.dueDate      ?? existing[3] ?? '',
    data.totalAmount  ?? existing[4] ?? '',
    existing[5] ?? 'Unpaid',
  ])
}

export async function updateInvoiceStatus(rowIndex: number, status: string): Promise<void> {
  const rows = await getSheetValues(SHEET_ID_AR_INVOICES, TAB_AR_INVOICES)
  const dataRows = rows.slice(1)
  const existing = dataRows.find((_, i) => i + 2 === rowIndex)
  if (!existing) throw new Error(`Invoice row ${rowIndex} not found`)

  await updateRow(SHEET_ID_AR_INVOICES, TAB_AR_INVOICES, rowIndex, [
    existing[0] ?? '',
    existing[1] ?? '',
    existing[2] ?? '',
    existing[3] ?? '',
    existing[4] ?? '',
    status,
  ])
}

// ─── AR_Payments ──────────────────────────────────────────────────────────────

export async function getAllPayments(): Promise<PaymentRow[]> {
  const rows = await getSheetValues(SHEET_ID_AR_PAYMENTS, TAB_AR_PAYMENTS)
  return rows.slice(1).map((row) => ({
    invoiceCode:  row[0] ?? '',
    paymentDate:  row[1] ?? '',
    amountPaid:   row[2] ?? '0',
    status:       row[3] ?? '',
  })).filter(r => r.invoiceCode !== '')
}

export async function createPayment(data: {
  invoiceCode: string
  paymentDate: string
  amountPaid: string
  status: string
}): Promise<void> {
  await appendRow(SHEET_ID_AR_PAYMENTS, TAB_AR_PAYMENTS, [
    data.invoiceCode,
    data.paymentDate,
    data.amountPaid,
    data.status,
  ])
}

async function getSheetId(spreadsheetId: string, tabName: string): Promise<number> {
  const sheets = getSheetsAPI()
  const meta = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = meta.data.sheets?.find(s => s.properties?.title === tabName)
  if (!sheet?.properties || sheet.properties.sheetId == null) {
    throw new Error(`Tab "${tabName}" not found in spreadsheet`)
  }
  return sheet.properties.sheetId
}

async function deleteSheetRow(spreadsheetId: string, tabName: string, sheetRowNumber: number): Promise<void> {
  const sheets = getSheetsAPI()
  const sheetId = await getSheetId(spreadsheetId, tabName)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: sheetRowNumber - 1,
            endIndex: sheetRowNumber,
          },
        },
      }],
    },
  })
}

export async function deleteInvoice(rowIndex: number): Promise<void> {
  await deleteSheetRow(SHEET_ID_AR_INVOICES, TAB_AR_INVOICES, rowIndex)
}

export async function deletePaymentsByInvoice(invoiceCode: string): Promise<void> {
  const rows = await getSheetValues(SHEET_ID_AR_PAYMENTS, TAB_AR_PAYMENTS)
  const rowNumbers: number[] = []
  rows.slice(1).forEach((row, index) => {
    if ((row[0] ?? '') === invoiceCode) rowNumbers.push(index + 2)
  })
  for (const rowNum of [...rowNumbers].reverse()) {
    await deleteSheetRow(SHEET_ID_AR_PAYMENTS, TAB_AR_PAYMENTS, rowNum)
  }
}

// ─── Canvas_Runs ──────────────────────────────────────────────────────────────

export async function getAllCanvasRuns(): Promise<CanvasRunRow[]> {
  const rows = await getSheetValues(SHEET_ID_CANVAS_RUNS, TAB_CANVAS_RUNS)
  return rows.slice(1).map((row, index) => ({
    canvasId:     row[0] ?? '',
    salesRepName: row[1] ?? '',
    dateOut:      row[2] ?? '',
    dateClosed:   row[3] ?? '',
    status:       (row[4] ?? 'Open') as 'Open' | 'Closed',
    rowIndex:     index + 2,
  })).filter(r => r.canvasId !== '')
}

export async function createCanvasRun(data: {
  canvasId: string
  salesRepName: string
  dateOut: string
}): Promise<void> {
  await appendRow(SHEET_ID_CANVAS_RUNS, TAB_CANVAS_RUNS, [
    data.canvasId,
    data.salesRepName,
    data.dateOut,
    '',
    'Open',
  ])
}

export async function closeCanvasRun(
  rowIndex: number,
  dateClosed: string
): Promise<void> {
  const rows = await getSheetValues(SHEET_ID_CANVAS_RUNS, TAB_CANVAS_RUNS)
  const dataRows = rows.slice(1)
  const existing = dataRows.find((_, i) => i + 2 === rowIndex)
  if (!existing) throw new Error(`Canvas run row ${rowIndex} not found`)

  await updateRow(SHEET_ID_CANVAS_RUNS, TAB_CANVAS_RUNS, rowIndex, [
    existing[0] ?? '',
    existing[1] ?? '',
    existing[2] ?? '',
    dateClosed,
    'Closed',
  ])
}

// ─── Canvas_Items ─────────────────────────────────────────────────────────────

export async function getAllCanvasItems(): Promise<CanvasItemRow[]> {
  const rows = await getSheetValues(SHEET_ID_CANVAS_ITEMS, TAB_CANVAS_ITEMS)
  return rows.slice(1).map((row) => ({
    canvasId:         row[0] ?? '',
    itemName:         row[1] ?? '',
    quantityBrought:  row[2] ?? '0',
    quantityReturned: row[3] ?? '',
  })).filter(r => r.canvasId !== '')
}

export async function createCanvasItems(
  items: Array<{ canvasId: string; itemName: string; quantityBrought: string }>
): Promise<void> {
  for (const item of items) {
    await appendRow(SHEET_ID_CANVAS_ITEMS, TAB_CANVAS_ITEMS, [
      item.canvasId,
      item.itemName,
      item.quantityBrought,
      '',
    ])
  }
}

export async function updateCanvasRun(
  rowIndex: number,
  data: { salesRepName?: string; dateOut?: string }
): Promise<void> {
  const rows = await getSheetValues(SHEET_ID_CANVAS_RUNS, TAB_CANVAS_RUNS)
  const dataRows = rows.slice(1)
  const existing = dataRows.find((_, i) => i + 2 === rowIndex)
  if (!existing) throw new Error(`Canvas run row ${rowIndex} not found`)

  await updateRow(SHEET_ID_CANVAS_RUNS, TAB_CANVAS_RUNS, rowIndex, [
    existing[0] ?? '',
    data.salesRepName ?? existing[1] ?? '',
    data.dateOut      ?? existing[2] ?? '',
    existing[3] ?? '',
    existing[4] ?? 'Open',
  ])
}

export async function deleteCanvasRun(rowIndex: number): Promise<void> {
  await deleteSheetRow(SHEET_ID_CANVAS_RUNS, TAB_CANVAS_RUNS, rowIndex)
}

export async function deleteCanvasItemsByRunId(canvasId: string): Promise<void> {
  const rows = await getSheetValues(SHEET_ID_CANVAS_ITEMS, TAB_CANVAS_ITEMS)
  const rowNumbers: number[] = []
  rows.slice(1).forEach((row, index) => {
    if ((row[0] ?? '') === canvasId) rowNumbers.push(index + 2)
  })
  for (const rowNum of [...rowNumbers].reverse()) {
    await deleteSheetRow(SHEET_ID_CANVAS_ITEMS, TAB_CANVAS_ITEMS, rowNum)
  }
}

export async function getNextInvoiceCode(invoiceDate: string): Promise<string> {
  const parts = invoiceDate.split('/')
  if (parts.length !== 3) throw new Error('Invalid date format for invoice code generation')
  const [, m, y] = parts
  const yy = y.slice(-2)
  const mm = m.padStart(2, '0')
  const prefix = `FP${yy}${mm}`

  const invoices = await getAllInvoices()
  let maxSerial = 0
  for (const inv of invoices) {
    if (inv.invoiceCode.startsWith(prefix)) {
      const serial = parseInt(inv.invoiceCode.slice(prefix.length)) || 0
      if (serial > maxSerial) maxSerial = serial
    }
  }
  return `${prefix}${String(maxSerial + 1).padStart(4, '0')}`
}

export async function getNextCanvasId(dateOut: string): Promise<string> {
  const parts = dateOut.split('/')
  if (parts.length !== 3) throw new Error('Invalid date format for canvas ID generation')
  const [, m, y] = parts
  const yy = y.slice(-2)
  const mm = m.padStart(2, '0')
  const prefix = `CVS${yy}${mm}`

  const runs = await getAllCanvasRuns()
  let maxSerial = 0
  for (const run of runs) {
    if (run.canvasId.startsWith(prefix)) {
      const serial = parseInt(run.canvasId.slice(prefix.length)) || 0
      if (serial > maxSerial) maxSerial = serial
    }
  }
  return `${prefix}${String(maxSerial + 1).padStart(4, '0')}`
}

export async function updateCanvasItemsReturned(
  canvasId: string,
  returned: Array<{ itemName: string; quantityReturned: string }>
): Promise<void> {
  const rows = await getSheetValues(SHEET_ID_CANVAS_ITEMS, TAB_CANVAS_ITEMS)
  const dataRows = rows.slice(1)

  for (const ret of returned) {
    const dataIndex = dataRows.findIndex(
      (row) => (row[0] ?? '') === canvasId && (row[1] ?? '') === ret.itemName
    )
    if (dataIndex === -1) continue

    const sheetRowNumber = dataIndex + 2
    const existing = dataRows[dataIndex]
    await updateRow(SHEET_ID_CANVAS_ITEMS, TAB_CANVAS_ITEMS, sheetRowNumber, [
      existing[0] ?? '',
      existing[1] ?? '',
      existing[2] ?? '',
      ret.quantityReturned,
    ])
  }
}
