import { NextRequest, NextResponse } from 'next/server'

type Params = { params: Promise<{ path: string[] }> }

// Legacy route — files are now served directly from Vercel Blob URLs.
// This route exists only for backwards compatibility with old file references.
export async function GET(_req: NextRequest, { params }: Params) {
  const { path: segments } = await params
  const filePath = segments.join('/')

  if (filePath.includes('..') || filePath.includes('\0')) {
    return NextResponse.json({ success: false, error: 'Invalid path' }, { status: 400 })
  }

  return NextResponse.json({ success: false, error: 'File not found. Files are now served via direct URLs.' }, { status: 404 })
}
