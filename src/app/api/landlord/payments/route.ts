import { NextRequest, NextResponse } from 'next/server'
import { requireLandlord } from '@/lib/auth-utils'
import { apiError, clampPageSize } from '@/lib/api-utils'
import { paymentService } from '@/server/services/payment.service'
import { createPaymentSchema } from '@/lib/validations/payment'

export async function GET(req: NextRequest) {
  try {
    const user = await requireLandlord()
    const { searchParams } = req.nextUrl
    const page = Number(searchParams.get('page')) || 1
    const pageSize = clampPageSize(searchParams.get('pageSize'))
    const status = searchParams.get('status') || undefined

    const [data, stats] = await Promise.all([
      paymentService.list({ landlordId: user.id, status, page, pageSize }),
      paymentService.getStats(user.id),
    ])

    return NextResponse.json({ success: true, ...data, stats })
  } catch (error) {
    return apiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireLandlord()
    const body = await req.json()
    const data = createPaymentSchema.parse(body)
    const payment = await paymentService.create(data, user.id)
    return NextResponse.json({ success: true, data: payment }, { status: 201 })
  } catch (error) {
    return apiError(error)
  }
}
