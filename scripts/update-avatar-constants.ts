/**
 * Update Avatar Constants with Supabase URLs
 * 
 * After uploading images to Supabase, run this script to automatically
 * update the default-avatars.ts file with the correct public URLs.
 */

import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

if (!supabaseUrl) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable!')
  console.error('Please set it in your .env.local file')
  process.exit(1)
}

const avatarMappings = [
  { id: 'joyboy', filename: 'user_joyboy.png' },
  { id: 'krimson', filename: 'user_krimson.png' },
  { id: 'mati', filename: 'user_mati.png' },
  { id: 'pek', filename: 'user_pek.png' },
]

const placeholderFilename = 'placeholder-user.jpg'

function getSupabaseUrl(filename: string): string {
  return `${supabaseUrl}/storage/v1/object/public/profile-images/${filename}`
}

function updateConstantsFile() {
  const constantsPath = path.join(process.cwd(), 'lib/constants/default-avatars.ts')
  
  if (!fs.existsSync(constantsPath)) {
    console.error(`❌ Constants file not found: ${constantsPath}`)
    process.exit(1)
  }
  
  let content = fs.readFileSync(constantsPath, 'utf-8')
  
  // Update each avatar URL
  avatarMappings.forEach(({ id, filename }) => {
    const supabaseUrl = getSupabaseUrl(filename)
    const localUrl = `/avatars/${filename}`
    
    // Replace the local URL with Supabase URL
    content = content.replace(
      new RegExp(`url: ['"]${localUrl}['"]`, 'g'),
      `url: '${supabaseUrl}'`
    )
  })
  
  // Update placeholder URL
  const placeholderSupabaseUrl = getSupabaseUrl(placeholderFilename)
  content = content.replace(
    /DEFAULT_AVATAR_URL = ['"]\/placeholder-user\.jpg['"]/,
    `DEFAULT_AVATAR_URL = '${placeholderSupabaseUrl}'`
  )
  
  // Remove TODO comments
  content = content.replace(/ \/\/ TODO: Replace with Supabase URL/g, '')
  content = content.replace(/TODO: After uploading.*?\n \*\//s, 'Avatars stored in Supabase Storage (profile-images bucket)\n */')
  
  // Write updated content
  fs.writeFileSync(constantsPath, content, 'utf-8')
  
  console.log('✅ Successfully updated default-avatars.ts with Supabase URLs!')
  console.log('\n📋 Updated URLs:')
  avatarMappings.forEach(({ id, filename }) => {
    console.log(`  - ${id}: ${getSupabaseUrl(filename)}`)
  })
  console.log(`  - placeholder: ${placeholderSupabaseUrl}`)
}

try {
  updateConstantsFile()
} catch (error) {
  console.error('❌ Error updating constants file:', error)
  process.exit(1)
}
