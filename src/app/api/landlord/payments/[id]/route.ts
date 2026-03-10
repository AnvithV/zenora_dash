import { NextRequest, NextResponse } from 'next/server'
import { requireLandlord } from '@/lib/auth-utils'
import { apiError } from '@/lib/api-utils'
import { paymentService } from '@/server/services/payment.service'
import { updatePaymentSchema } from '@/lib/validations/payment'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireLandlord()
    const { id } = await params
    const payment = await paymentService.getById(id)
    if (payment.lease.tenant.assignedLandlordId !== user.id) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: payment })
  } catch (error) {
    return apiError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireLandlord()
    const { id } = await params
    const body = await req.json()
    const data = updatePaymentSchema.parse(body)
    const payment = await paymentService.update(id, data, user.id)
    return NextResponse.json({ success: true, data: payment })
  } catch (error) {
    return apiError(error)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireLandlord()
    const { id } = await params
    await paymentService.delete(id, user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(error)
  }
}
