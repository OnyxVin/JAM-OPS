import { NextRequest, NextResponse } from 'next/server'
import { updateCustomer, deleteCustomer } from '@/lib/sheets'

type Params = { params: { code: string } }

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const customerCode = decodeURIComponent(params.code)
    const body = await request.json()
    const { customerName, address } = body

    await updateCustomer(customerCode, {
      customerName: typeof customerName === 'string' ? customerName.trim() : undefined,
      address:      typeof address === 'string'      ? address.trim()      : undefined,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PUT /api/customers/[code]]', error)
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const customerCode = decodeURIComponent(params.code)
    await deleteCustomer(customerCode)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/customers/[code]]', error)
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
  }
}
