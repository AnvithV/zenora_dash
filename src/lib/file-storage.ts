import { put, del } from '@vercel/blob'

export async function saveFile(buffer: Buffer, fileName: string): Promise<string> {
  const blob = await put(fileName, buffer, { access: 'public' })
  return blob.url
}

export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    await del(fileUrl)
  } catch {
    // File may not exist, ignore
  }
}
