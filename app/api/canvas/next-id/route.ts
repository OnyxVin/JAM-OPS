import { NextRequest, NextResponse } from 'next/server'
import { getNextCanvasId } from '@/lib/sheets'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    if (!date) {
      return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 })
    }
    const id = await getNextCanvasId(date)
    return NextResponse.json({ id })
  } catch (error) {
    console.error('[GET /api/canvas/next-id]', error)
    return NextResponse.json({ error: 'Failed to generate ID' }, { status: 500 })
  }
}
