import { readFile, writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

export async function saveFile(buffer: Buffer, fileName: string): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true })
  const filePath = path.join(UPLOAD_DIR, fileName)
  await writeFile(filePath, buffer)
  return fileName
}

export async function getFile(filePath: string): Promise<{ buffer: Buffer; mimeType: string }> {
  // Strip /api/files/ prefix if present
  const cleanPath = filePath.replace(/^\/api\/files\//, '')
  const fullPath = path.join(UPLOAD_DIR, cleanPath)
  const resolved = path.resolve(fullPath)
  if (!resolved.startsWith(UPLOAD_DIR)) {
    throw new Error('Invalid file path')
  }
  const buffer = await readFile(fullPath)
  const ext = path.extname(cleanPath).toLowerCase()
  const mimeType = MIME_TYPES[ext] ?? 'application/octet-stream'
  return { buffer, mimeType }
}

export async function deleteFile(filePath: string): Promise<void> {
  const cleanPath = filePath.replace(/^\/api\/files\//, '')
  const fullPath = path.join(UPLOAD_DIR, cleanPath)
  const resolved = path.resolve(fullPath)
  if (!resolved.startsWith(UPLOAD_DIR)) {
    throw new Error('Invalid file path')
  }
  try {
    await unlink(fullPath)
  } catch {
    // File may not exist, ignore
  }
}
