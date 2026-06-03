import { NextRequest, NextResponse } from 'next/server'
import { getAllCustomers, createCustomer } from '@/lib/sheets'

export async function GET() {
  try {
    const customers = await getAllCustomers()
    return NextResponse.json({ customers })
  } catch (error) {
    console.error('[GET /api/customers]', error)
    return NextResponse.json({ error: 'Failed to load customers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, address } = body

    if (!customerName || typeof customerName !== 'string' || customerName.trim() === '') {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 })
    }

    const customerCode = await createCustomer({
      customerName: customerName.trim(),
      address:      typeof address === 'string' ? address.trim() : '',
    })

    return NextResponse.json({ success: true, customerCode }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/customers]', error)
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}
