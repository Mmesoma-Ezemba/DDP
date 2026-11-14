import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { uploadUserAvatar, deleteOldUserAvatars, validateAvatarFile } from "@/lib/supabase/storage"
import { updateUser } from "@/lib/supabase/users"

/**
 * Upload user avatar
 * POST /api/profile/avatar/upload
 */
export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string
    const walletAddress = formData.get("walletAddress") as string

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    if (!userId && !walletAddress) {
      return NextResponse.json(
        { error: "User ID or wallet address required" },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateAvatarFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Upload avatar to storage
    const result = await uploadUserAvatar(userId, file)

    if (!result) {
      return NextResponse.json(
        { error: "Failed to upload avatar" },
        { status: 500 }
      )
    }

    // Clean up old avatars (optional - keeps storage clean)
    const fileName = result.path.split("/").pop()
    await deleteOldUserAvatars(userId, fileName)

    // Update user profile with new avatar URL
    if (walletAddress) {
      await updateUser(walletAddress, {
        avatar_url: result.url,
      })
    }

    return NextResponse.json({
      success: true,
      avatarUrl: result.url,
      path: result.path,
    })
  } catch (error: any) {
    console.error("Error uploading avatar:", error)
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    )
  }
}

/**
 * Delete user avatar
 * DELETE /api/profile/avatar/upload
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId, filePath, walletAddress } = await request.json()

    if (!userId || !filePath) {
      return NextResponse.json(
        { error: "User ID and file path required" },
        { status: 400 }
      )
    }

    // Delete avatar from storage
    const success = await deleteOldUserAvatars(userId)

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete avatar" },
        { status: 500 }
      )
    }

    // Update user profile to default avatar (optional)
    if (walletAddress) {
      const { DEFAULT_AVATAR_URL } = await import("@/lib/constants/default-avatars")
      await updateUser(walletAddress, {
        avatar_url: DEFAULT_AVATAR_URL,
      })
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    console.error("Error deleting avatar:", error)
    return NextResponse.json(
      { error: error.message || "Delete failed" },
      { status: 500 }
    )
  }
}
