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
  try {
    const sheets = google.sheets({ version: 'v4', auth: getOAuth2Client() })
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID_AR_INVOICES!,
      range: process.env.GOOGLE_TAB_AR_INVOICES ?? 'Sheet1',
    })
    const rows = (response.data.values ?? []) as string[][]

    const colMap: Record<string, number> = {}
    if (rows.length > 0) {
      rows[0].forEach((h, i) => {
        colMap[h.trim().toLowerCase().replace(/\s+/g, ' ')] = i
      })
    }

    return NextResponse.json({
      headerRow: rows[0] ?? [],
      dataRows: rows.slice(1, 4),
      colMap,
      diagnosis: {
        totalAmountIndex: colMap['total amount'] ?? 'NOT FOUND',
        firstRowTotalAmountValue: rows[1]
          ? (rows[1][colMap['total amount'] ?? -1] ?? 'CELL IS EMPTY')
          : 'NO DATA ROWS',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
