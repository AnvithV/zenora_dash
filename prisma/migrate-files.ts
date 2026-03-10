import { PrismaClient } from '@prisma/client'
import { readdir, copyFile, mkdir } from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  const publicUploads = path.join(process.cwd(), 'public', 'uploads')
  const newUploads = path.join(process.cwd(), 'uploads')

  // Create new uploads directory
  await mkdir(newUploads, { recursive: true })

  // Copy files
  try {
    const files = await readdir(publicUploads)
    console.log(`Found ${files.length} files to migrate`)

    for (const file of files) {
      const src = path.join(publicUploads, file)
      const dest = path.join(newUploads, file)
      await copyFile(src, dest)
      console.log(`  Copied: ${file}`)
    }
  } catch (error) {
    console.log('No public/uploads directory found, skipping file copy')
  }

  // Update document URLs in database
  const documents = await prisma.document.findMany({
    where: { url: { startsWith: '/uploads/' } },
  })

  console.log(`Found ${documents.length} document records to update`)

  for (const doc of documents) {
    const newUrl = doc.url.replace('/uploads/', '/api/files/')
    await prisma.document.update({
      where: { id: doc.id },
      data: { url: newUrl },
    })
    console.log(`  Updated: ${doc.url} → ${newUrl}`)
  }

  console.log('Migration complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
