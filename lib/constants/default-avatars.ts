/**
 * Default Profile Avatars
 * 
 * These avatars are stored in Supabase Storage and available for users
 * to select as their profile picture, or assigned randomly on account creation.
 * 
 * Images are hosted in the 'profile-images' bucket in Supabase Storage
 */

export interface DefaultAvatar {
  id: string
  name: string
  url: string
  description?: string
}

/**
 * Default avatar options for users
 */
export const DEFAULT_AVATARS: DefaultAvatar[] = [
  {
    id: 'joyboy',
    name: 'Joyboy',
    url: 'https://gxpvmfrpjszzfhnwlwfu.supabase.co/storage/v1/object/public/profile-images/user_joyboy.png',
    description: 'Joyboy avatar'
  },
  {
    id: 'krimson',
    name: 'Krimson',
    url: 'https://gxpvmfrpjszzfhnwlwfu.supabase.co/storage/v1/object/public/profile-images/user_krimson.png',
    description: 'Krimson avatar'
  },
  {
    id: 'mati',
    name: 'Mati',
    url: 'https://gxpvmfrpjszzfhnwlwfu.supabase.co/storage/v1/object/public/profile-images/user_mati.png',
    description: 'Mati avatar'
  },
  {
    id: 'pek',
    name: 'Pek',
    url: 'https://gxpvmfrpjszzfhnwlwfu.supabase.co/storage/v1/object/public/profile-images/user_pek.png',
    description: 'Pek avatar'
  }
]

/**
 * Default placeholder avatar for users without a profile picture
 */
export const DEFAULT_AVATAR_URL = 'https://gxpvmfrpjszzfhnwlwfu.supabase.co/storage/v1/object/public/profile-images/placeholder-user.jpg'

/**
 * Get a random default avatar from the available options
 * Excludes the placeholder avatar
 */
export function getRandomAvatar(): DefaultAvatar {
  const avatars = DEFAULT_AVATARS
  const randomIndex = Math.floor(Math.random() * avatars.length)
  return avatars[randomIndex]
}

/**
 * Get avatar by ID
 */
export function getAvatarById(id: string): DefaultAvatar | undefined {
  return DEFAULT_AVATARS.find(avatar => avatar.id === id)
}

/**
 * Get all available avatars (for display in profile selector)
 */
export function getAllAvatars(): DefaultAvatar[] {
  return DEFAULT_AVATARS
}

/**
 * Check if a URL is a default avatar
 */
export function isDefaultAvatar(url: string): boolean {
  return DEFAULT_AVATARS.some(avatar => avatar.url === url) || url === DEFAULT_AVATAR_URL
}

/**
 * Get Supabase storage path for profile images
 */
export function getProfileImagePath(filename: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL not set, using local path')
    return `/avatars/${filename}`
  }
  return `${supabaseUrl}/storage/v1/object/public/profile-images/${filename}`
}

/**
 * Get Supabase storage path for user-uploaded avatars
 */
export function getUserAvatarPath(userId: string, filename: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL not set, using local path')
    return `/avatars/${filename}`
  }
  return `${supabaseUrl}/storage/v1/object/public/user-avatars/${userId}/${filename}`
}
