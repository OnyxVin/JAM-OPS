import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import type { InventoryItem } from '@/lib/types'

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from('inventory')
      .select('*')
      .order('item_name', { ascending: true })

    if (error) throw error

    const items: InventoryItem[] = (data ?? []).map((row) => ({
      id:           row.id,
      itemCode:     row.item_code,
      partNumber:   row.part_number,
      itemName:     row.item_name,
      brand:        row.brand,
      basePrice:    Number(row.base_price ?? 0),
      sellingPrice: Number(row.selling_price ?? 0),
    }))

    return NextResponse.json(items)
  } catch (error) {
    console.error('[GET /api/inventory]', error)
    return NextResponse.json({ error: 'Failed to load inventory' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemCode, partNumber, itemName, brand, basePrice, sellingPrice } = body

    if (!itemName) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 })
    }

    const { data, error } = await getSupabase()
      .from('inventory')
      .insert({
        item_code:     String(itemCode ?? ''),
        part_number:   String(partNumber ?? ''),
        item_name:     String(itemName),
        brand:         String(brand ?? ''),
        base_price:    Number(basePrice ?? 0),
        selling_price: Number(sellingPrice ?? 0),
      })
      .select()
      .single()

    if (error) throw error

    const item: InventoryItem = {
      id:           data.id,
      itemCode:     data.item_code,
      partNumber:   data.part_number,
      itemName:     data.item_name,
      brand:        data.brand,
      basePrice:    Number(data.base_price ?? 0),
      sellingPrice: Number(data.selling_price ?? 0),
    }

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('[POST /api/inventory]', error)
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 })
  }
}
