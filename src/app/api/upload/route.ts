import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { saveFile } from '@/lib/file-storage'
import { rateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'
import { MAX_FILE_SIZE } from '@/lib/constants'
import path from 'path'
import { apiError } from '@/lib/api-utils'

const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.doc', '.docx', '.txt']

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()

    const { success, resetIn } = rateLimit(`upload:${user.id}`, RATE_LIMITS.UPLOAD)
    if (!success) return rateLimitResponse(resetIn)

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'File too large (max 10MB)' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'File type not allowed' }, { status: 400 })
    }

    const ext = path.extname(file.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ success: false, error: 'File extension not allowed' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_')
    const uniqueName = `${baseName}-${Date.now()}${ext}`

    const url = await saveFile(buffer, uniqueName)

    return NextResponse.json({
      success: true,
      data: { url, fileName: uniqueName, fileSize: file.size, mimeType: file.type },
    }, { status: 201 })
  } catch (error) {
    return apiError(error)
  }
}
