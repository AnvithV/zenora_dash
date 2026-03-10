import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { getFile } from '@/lib/file-storage'

type Params = { params: Promise<{ path: string[] }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAuth()
    const { path: segments } = await params
    const filePath = segments.join('/')

    // Prevent path traversal
    if (filePath.includes('..') || filePath.includes('\0')) {
      return NextResponse.json({ success: false, error: 'Invalid path' }, { status: 400 })
    }

    const { buffer, mimeType } = await getFile(filePath)

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'private, no-cache',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error'
    if (message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 })
  }
}
