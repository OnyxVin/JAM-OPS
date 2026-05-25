import { NextRequest, NextResponse } from 'next/server'
import {
  getAllCanvasRuns,
  closeCanvasRun,
  createCanvasItems,
  updateCanvasItemsSold,
  updateCanvasRun,
  deleteCanvasRun,
  deleteCanvasItemsByRunId,
} from '@/lib/sheets'

type Params = { params: { id: string } }

// POST /api/canvas/[id] — append items to an existing open run
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const canvasId = params.id
    const body = await request.json()
    const { items } = body

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    await createCanvasItems(
      items.map((item: { itemName: string; quantityBrought: string }) => ({
        canvasId,
        itemName: String(item.itemName),
        quantityBrought: String(item.quantityBrought),
      }))
    )

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/canvas/[id]]', error)
    return NextResponse.json({ error: 'Failed to add items' }, { status: 500 })
  }
}

// PUT /api/canvas/[id] — edit run details (salesRepName, dateOut)
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const canvasId = params.id
    const body = await request.json()
    const { salesRepName, dateOut } = body

    const runs = await getAllCanvasRuns()
    const run = runs.find((r) => r.canvasId === canvasId)
    if (!run) {
      return NextResponse.json({ error: 'Canvas run not found' }, { status: 404 })
    }

    await updateCanvasRun(run.rowIndex, {
      salesRepName: salesRepName ? String(salesRepName) : undefined,
      dateOut: dateOut ? String(dateOut) : undefined,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PUT /api/canvas/[id]]', error)
    return NextResponse.json({ error: 'Failed to update canvas run' }, { status: 500 })
  }
}

// DELETE /api/canvas/[id] — delete run and all its items
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const canvasId = params.id

    const runs = await getAllCanvasRuns()
    const run = runs.find((r) => r.canvasId === canvasId)
    if (!run) {
      return NextResponse.json({ error: 'Canvas run not found' }, { status: 404 })
    }

    await deleteCanvasItemsByRunId(canvasId)
    await deleteCanvasRun(run.rowIndex)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/canvas/[id]]', error)
    return NextResponse.json({ error: 'Failed to delete canvas run' }, { status: 500 })
  }
}

// PATCH /api/canvas/[id] — close a canvas run
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const canvasId = params.id
    const body = await request.json()
    const { dateClosed, soldItems } = body

    if (!dateClosed || !Array.isArray(soldItems)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const runs = await getAllCanvasRuns()
    const run = runs.find((r) => r.canvasId === canvasId)
    if (!run) {
      return NextResponse.json({ error: 'Canvas run not found' }, { status: 404 })
    }

    await closeCanvasRun(run.rowIndex, String(dateClosed))
    await updateCanvasItemsSold(
      canvasId,
      soldItems.map((item: { itemName: string; quantitySold: string }) => ({
        itemName: String(item.itemName),
        quantitySold: String(item.quantitySold),
      }))
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PATCH /api/canvas/[id]]', error)
    return NextResponse.json({ error: 'Failed to close canvas run' }, { status: 500 })
  }
}
