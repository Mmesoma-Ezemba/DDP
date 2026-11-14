/**
 * Upload Profile Images to Supabase Storage
 * 
 * This script uploads all profile images to Supabase storage
 * for use as default and template profile pictures.
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('\nRequired environment variables:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY as fallback)')
  console.error('\n📖 Please see docs/profile-images-upload-guide.md for detailed setup instructions')
  console.error('\nQuick setup:')
  console.error('  1. Go to your Supabase Dashboard → Settings → API')
  console.error('  2. Copy your Project URL and Service Role Key')
  console.error('  3. Create .env.local file with:')
  console.error('     NEXT_PUBLIC_SUPABASE_URL=your-url')
  console.error('     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
  console.error('\nAlternatively, you can upload manually via Supabase Dashboard.')
  console.error('See Method 2 in docs/profile-images-upload-guide.md')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const BUCKET_NAME = 'profile-images'
const IMAGE_PATHS = [
  { file: 'public/avatars/user_joyboy.png', name: 'user_joyboy.png' },
  { file: 'public/avatars/user_krimson.png', name: 'user_krimson.png' },
  { file: 'public/avatars/user_mati.png', name: 'user_mati.png' },
  { file: 'public/avatars/user_pek.png', name: 'user_pek.png' },
  { file: 'public/placeholder-user.jpg', name: 'placeholder-user.jpg' },
]

async function createBucket() {
  console.log('📦 Creating storage bucket...')
  
  // Check if bucket already exists
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME)
  
  if (bucketExists) {
    console.log('✓ Bucket already exists')
    return true
  }
  
  // Create new bucket with public access
  const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  })
  
  if (error) {
    console.error('❌ Error creating bucket:', error)
    return false
  }
  
  console.log('✓ Bucket created successfully')
  return true
}

async function uploadImage(filePath: string, fileName: string) {
  const fullPath = path.join(process.cwd(), filePath)
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${fullPath}`)
    return false
  }
  
  console.log(`📤 Uploading ${fileName}...`)
  
  // Read file
  const fileBuffer = fs.readFileSync(fullPath)
  const fileExt = path.extname(fileName).toLowerCase()
  const contentType = fileExt === '.png' ? 'image/png' : 'image/jpeg'
  
  // Upload to Supabase
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, fileBuffer, {
      contentType,
      cacheControl: '3600',
      upsert: true // Replace if already exists
    })
  
  if (error) {
    console.error(`❌ Error uploading ${fileName}:`, error)
    return false
  }
  
  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName)
  
  console.log(`✓ Uploaded: ${publicUrlData.publicUrl}`)
  return publicUrlData.publicUrl
}

async function main() {
  console.log('🚀 Starting profile image upload...\n')
  
  // Step 1: Create bucket
  const bucketCreated = await createBucket()
  if (!bucketCreated) {
    console.error('❌ Failed to create bucket. Exiting.')
    process.exit(1)
  }
  
  console.log('')
  
  // Step 2: Upload all images
  const results = []
  for (const image of IMAGE_PATHS) {
    const url = await uploadImage(image.file, image.name)
    if (url) {
      results.push({ name: image.name, url })
    }
  }
  
  console.log('\n✅ Upload complete!\n')
  console.log('📋 Uploaded Images:')
  console.log('==================')
  results.forEach(({ name, url }) => {
    console.log(`${name}:`)
    console.log(`  ${url}\n`)
  })
  
  console.log('💡 Usage in your app:')
  console.log('=====================')
  console.log('You can now use these URLs as default profile pictures.')
  console.log('Consider storing these URLs in a constants file for easy access.')
  console.log('\nExample:')
  console.log(`
export const DEFAULT_AVATARS = [
${results.map(r => `  '${r.url}',`).join('\n')}
]
  `)
}

main().catch(console.error)
