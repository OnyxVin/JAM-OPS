import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const body = await request.json()
    const { itemCode, partNumber, itemName, brand } = body

    if (!itemName) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('inventory')
      .update({
        item_code:   String(itemCode ?? ''),
        part_number: String(partNumber ?? ''),
        item_name:   String(itemName),
        brand:       String(brand ?? ''),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      id:         data.id,
      itemCode:   data.item_code,
      partNumber: data.part_number,
      itemName:   data.item_name,
      brand:      data.brand,
    })
  } catch (error) {
    console.error('[PUT /api/inventory/[id]]', error)
    return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const { error } = await supabase.from('inventory').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/inventory/[id]]', error)
    return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 })
  }
}
