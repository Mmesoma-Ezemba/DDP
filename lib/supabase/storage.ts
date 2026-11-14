/**
 * Supabase Storage Operations
 * Handles file uploads and management for avatars and other assets
 */

import { supabase } from "./client"
import { getUserAvatarPath } from "@/lib/constants/default-avatars"

// Storage bucket names
export const STORAGE_BUCKETS = {
  PROFILE_IMAGES: "profile-images",
  USER_AVATARS: "user-avatars",
} as const

// =====================================================
// AVATAR UPLOAD OPERATIONS
// =====================================================

/**
 * Upload a user's custom avatar to Supabase Storage
 * Files are stored in user-avatars/{userId}/avatar.{ext}
 */
export async function uploadUserAvatar(
  userId: string,
  file: File
): Promise<{ url: string; path: string } | null> {
  try {
    // Generate unique filename with timestamp
    const fileExt = file.name.split(".").pop()
    const fileName = `avatar-${Date.now()}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    // Upload file to storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.USER_AVATARS)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true, // Replace if exists
      })

    if (error) {
      console.error("Error uploading avatar:", error)
      throw new Error(error.message)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.USER_AVATARS)
      .getPublicUrl(filePath)

    return {
      url: urlData.publicUrl,
      path: filePath,
    }
  } catch (error: any) {
    console.error("Error in uploadUserAvatar:", error)
    throw error
  }
}

/**
 * Delete a user's avatar from storage
 */
export async function deleteUserAvatar(
  userId: string,
  filePath: string
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.USER_AVATARS)
      .remove([filePath])

    if (error) {
      console.error("Error deleting avatar:", error)
      return false
    }

    return true
  } catch (error: any) {
    console.error("Error in deleteUserAvatar:", error)
    return false
  }
}

/**
 * List all avatars for a user
 */
export async function listUserAvatars(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.USER_AVATARS)
      .list(userId)

    if (error) {
      console.error("Error listing avatars:", error)
      return []
    }

    return data?.map((file) => file.name) || []
  } catch (error: any) {
    console.error("Error in listUserAvatars:", error)
    return []
  }
}

/**
 * Delete all old avatars for a user (cleanup when uploading new)
 */
export async function deleteOldUserAvatars(
  userId: string,
  keepFileName?: string
): Promise<boolean> {
  try {
    const files = await listUserAvatars(userId)

    if (files.length === 0) {
      return true
    }

    // Filter out the file we want to keep
    const filesToDelete = keepFileName
      ? files.filter((file) => file !== keepFileName)
      : files

    if (filesToDelete.length === 0) {
      return true
    }

    // Delete old files
    const filePaths = filesToDelete.map((file) => `${userId}/${file}`)
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.USER_AVATARS)
      .remove(filePaths)

    if (error) {
      console.error("Error deleting old avatars:", error)
      return false
    }

    return true
  } catch (error: any) {
    console.error("Error in deleteOldUserAvatars:", error)
    return false
  }
}

// =====================================================
// PROFILE IMAGES OPERATIONS (Default Avatars)
// =====================================================

/**
 * Upload a profile image to the profile-images bucket
 * Used for adding new default avatars
 */
export async function uploadProfileImage(
  fileName: string,
  file: File
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.PROFILE_IMAGES)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      })

    if (error) {
      console.error("Error uploading profile image:", error)
      throw new Error(error.message)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.PROFILE_IMAGES)
      .getPublicUrl(fileName)

    return urlData.publicUrl
  } catch (error: any) {
    console.error("Error in uploadProfileImage:", error)
    return null
  }
}

/**
 * List all profile images
 */
export async function listProfileImages(): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.PROFILE_IMAGES)
      .list()

    if (error) {
      console.error("Error listing profile images:", error)
      return []
    }

    return data?.map((file) => file.name) || []
  } catch (error: any) {
    console.error("Error in listProfileImages:", error)
    return []
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get the public URL for a storage file
 */
export function getPublicUrl(bucket: string, filePath: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
  return data.publicUrl
}

/**
 * Check if a file exists in storage
 */
export async function fileExists(bucket: string, filePath: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(filePath)

    if (error) {
      return false
    }

    return (data && data.length > 0) || false
  } catch (error: any) {
    return false
  }
}

/**
 * Validate file for avatar upload
 */
export function validateAvatarFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 2 * 1024 * 1024 // 2MB
  const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"]

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only PNG, JPG, and WEBP are allowed.",
    }
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: "File size exceeds 2MB limit.",
    }
  }

  return { valid: true }
}
