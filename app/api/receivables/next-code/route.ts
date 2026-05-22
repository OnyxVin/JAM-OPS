import { NextRequest, NextResponse } from 'next/server'
import { getNextInvoiceCode } from '@/lib/sheets'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    if (!date) {
      return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 })
    }
    const code = await getNextInvoiceCode(date)
    return NextResponse.json({ code })
  } catch (error) {
    console.error('[GET /api/receivables/next-code]', error)
    return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 })
  }
}
