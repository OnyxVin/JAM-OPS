import { NextRequest, NextResponse } from 'next/server'
import { getAllCanvasRuns, getAllCanvasItems, createCanvasRun, createCanvasItems, getNextCanvasId } from '@/lib/sheets'
import type { CanvasRun, CanvasItem, CanvasResponse } from '@/lib/types'

export async function GET() {
  try {
    const [runRows, itemRows] = await Promise.all([
      getAllCanvasRuns(),
      getAllCanvasItems(),
    ])

    const runs: CanvasRun[] = runRows.map((run) => {
      const matchingItems: CanvasItem[] = itemRows
        .filter((item) => item.canvasId === run.canvasId)
        .map((item) => {
          const quantityBrought = parseInt(item.quantityBrought) || 0
          const quantityReturned =
            run.status === 'Closed' && item.quantityReturned !== ''
              ? parseInt(item.quantityReturned) || 0
              : null
          const quantitySold =
            quantityReturned !== null ? quantityBrought - quantityReturned : null

          return {
            canvasId: item.canvasId,
            itemName: item.itemName,
            quantityBrought,
            quantityReturned,
            quantitySold,
          }
        })

      const totalQuantityBrought = matchingItems.reduce(
        (sum, i) => sum + i.quantityBrought,
        0
      )
      const totalQuantitySold =
        run.status === 'Closed'
          ? matchingItems.reduce((sum, i) => sum + (i.quantitySold ?? 0), 0)
          : null

      return {
        ...run,
        items: matchingItems,
        totalQuantityBrought,
        totalQuantitySold,
      }
    })

    const response: CanvasResponse = {
      openRuns: runs.filter((r) => r.status === 'Open'),
      closedRuns: runs.filter((r) => r.status === 'Closed'),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[GET /api/canvas]', error)
    return NextResponse.json({ error: 'Failed to load canvas runs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { salesRepName, dateOut, items } = body
    const canvasIdFromBody = body.canvasId ? String(body.canvasId).trim() : ''

    if (!salesRepName || !dateOut || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const canvasId = canvasIdFromBody || await getNextCanvasId(String(dateOut))

    await createCanvasRun({ canvasId, salesRepName: String(salesRepName), dateOut: String(dateOut) })
    await createCanvasItems(
      items.map((item: { itemName: string; quantityBrought: string }) => ({
        canvasId,
        itemName: String(item.itemName),
        quantityBrought: String(item.quantityBrought),
      }))
    )

    return NextResponse.json({ success: true, canvasId }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/canvas]', error)
    return NextResponse.json({ error: 'Failed to create canvas run' }, { status: 500 })
  }
}
