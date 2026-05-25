import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

function getOAuth2Client(): OAuth2Client {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    'https://oauth2.googleapis.com/token'
  )
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN! })
  return client
}

export async function GET() {
  const sheets = google.sheets({ version: 'v4', auth: getOAuth2Client() })

  const sheetIds = {
    AR_INVOICES: process.env.GOOGLE_SHEET_ID_AR_INVOICES ?? 'NOT SET',
    AR_PAYMENTS: process.env.GOOGLE_SHEET_ID_AR_PAYMENTS ?? 'NOT SET',
    CANVAS_RUNS: process.env.GOOGLE_SHEET_ID_CANVAS_RUNS ?? 'NOT SET',
    CANVAS_ITEMS: process.env.GOOGLE_SHEET_ID_CANVAS_ITEMS ?? 'NOT SET',
  }

  const tabNames = {
    AR_INVOICES: process.env.GOOGLE_TAB_AR_INVOICES ?? 'Sheet1 (default)',
    AR_PAYMENTS: process.env.GOOGLE_TAB_AR_PAYMENTS ?? 'Sheet1 (default)',
  }

  let invoiceHeaders: string[] = []
  let invoiceRowCount = 0
  let paymentHeaders: string[] = []
  let paymentRowCount = 0
  let error: string | null = null

  try {
    if (sheetIds.AR_INVOICES !== 'NOT SET') {
      const tab = process.env.GOOGLE_TAB_AR_INVOICES ?? 'Sheet1'
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetIds.AR_INVOICES,
        range: `${tab}!A1:Z`,
        valueRenderOption: 'UNFORMATTED_VALUE',
      })
      const rows = res.data.values ?? []
      invoiceHeaders = (rows[0] ?? []).map(String)
      invoiceRowCount = Math.max(0, rows.length - 1)
    }
  } catch (e: unknown) {
    error = `Invoice sheet error: ${e instanceof Error ? e.message : String(e)}`
  }

  try {
    if (sheetIds.AR_PAYMENTS !== 'NOT SET') {
      const tab = process.env.GOOGLE_TAB_AR_PAYMENTS ?? 'Sheet1'
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetIds.AR_PAYMENTS,
        range: `${tab}!A1:Z`,
        valueRenderOption: 'UNFORMATTED_VALUE',
      })
      const rows = res.data.values ?? []
      paymentHeaders = (rows[0] ?? []).map(String)
      paymentRowCount = Math.max(0, rows.length - 1)
    }
  } catch (e: unknown) {
    if (!error) error = `Payment sheet error: ${e instanceof Error ? e.message : String(e)}`
  }

  return NextResponse.json({
    sheetIds,
    tabNames,
    invoiceSheet: {
      headers: invoiceHeaders,
      dataRowCount: invoiceRowCount,
    },
    paymentSheet: {
      headers: paymentHeaders,
      dataRowCount: paymentRowCount,
    },
    error,
  })
}
