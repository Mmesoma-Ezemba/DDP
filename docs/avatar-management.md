# Avatar Management System

Complete documentation for the avatar management system in the Digital Legacy platform.

## Overview

The avatar management system provides users with:
- **Default Avatars**: Pre-designed avatars stored in Supabase Storage
- **Random Assignment**: New users automatically receive a random default avatar
- **Custom Uploads**: Users can upload their own profile pictures
- **Easy Selection**: Intuitive UI for choosing and changing avatars

---

## Architecture

### Components

#### 1. **AvatarSelector** (`components/profile/avatar-selector.tsx`)
A grid-based selector displaying default avatars with preview.

**Features:**
- Grid display of all default avatars
- Visual preview of selected avatar
- Hover effects and selection indicators
- Option to trigger custom upload

**Props:**
```typescript
interface AvatarSelectorProps {
  currentAvatar?: string        // Current avatar URL
  onAvatarSelect: (url: string) => void  // Callback when avatar selected
  onUploadClick?: () => void    // Callback to open upload dialog
  className?: string            // Optional styling
}
```

**Usage:**
```tsx
import { AvatarSelector } from "@/components/profile"

<AvatarSelector
  currentAvatar={user.avatar_url}
  onAvatarSelect={(url) => updateUserAvatar(url)}
  onUploadClick={() => setShowUpload(true)}
/>
```

#### 2. **AvatarUpload** (`components/profile/avatar-upload.tsx`)
Drag-and-drop file upload component with validation.

**Features:**
- Drag-and-drop file upload
- File type validation (PNG, JPG, WEBP)
- Size validation (max 2MB)
- Image preview before upload
- Progress indicators and error handling

**Props:**
```typescript
interface AvatarUploadProps {
  userId: string                // User ID for storage path
  currentAvatar?: string        // Current avatar URL
  onUploadSuccess: (url: string) => void  // Callback on success
  onCancel?: () => void         // Callback to cancel upload
  className?: string            // Optional styling
}
```

**Usage:**
```tsx
import { AvatarUpload } from "@/components/profile"

<AvatarUpload
  userId={user.id}
  currentAvatar={user.avatar_url}
  onUploadSuccess={(url) => {
    updateUserAvatar(url)
    setShowUpload(false)
  }}
  onCancel={() => setShowUpload(false)}
/>
```

---

## Storage Configuration

### Buckets

#### **profile-images** (Default Avatars)
- **Public:** Yes
- **Size Limit:** 5MB
- **Allowed Types:** PNG, JPG, WEBP, GIF
- **Purpose:** Store default avatar images available to all users

**Structure:**
```
profile-images/
├── user_joyboy.png
├── user_krimson.png
├── user_mati.png
├── user_pek.png
└── placeholder-user.jpg
```

#### **user-avatars** (Custom Uploads)
- **Public:** Yes
- **Size Limit:** 2MB
- **Allowed Types:** PNG, JPG, WEBP
- **Purpose:** Store user-uploaded custom avatars

**Structure:**
```
user-avatars/
└── {userId}/
    ├── avatar-1234567890.png
    └── avatar-1234567891.jpg
```

### Storage Policies

**Profile Images:**
- Anyone can view (public read)
- Authenticated users can upload
- Users can update/delete their own uploads

**User Avatars:**
- Anyone can view (public read)
- Users can only upload to their own folder (`{userId}/`)
- Users can only update/delete their own avatars

---

## API Routes

### POST `/api/profile/avatar/upload`

Upload a custom avatar for a user.

**Request:**
```typescript
FormData {
  file: File                  // Image file to upload
  userId: string              // User ID
  walletAddress?: string      // Optional: Update user profile
}
```

**Response:**
```typescript
{
  success: true,
  avatarUrl: string,          // Public URL of uploaded avatar
  path: string                // Storage path
}
```

**Validation:**
- File type must be PNG, JPG, or WEBP
- File size must be under 2MB
- User must be authenticated

**Example:**
```typescript
const formData = new FormData()
formData.append("file", file)
formData.append("userId", user.id)
formData.append("walletAddress", user.wallet_address)

const response = await fetch("/api/profile/avatar/upload", {
  method: "POST",
  body: formData,
})

const data = await response.json()
console.log(data.avatarUrl) // New avatar URL
```

### DELETE `/api/profile/avatar/upload`

Delete a user's custom avatar.

**Request:**
```typescript
{
  userId: string,
  filePath: string,
  walletAddress?: string      // Optional: Reset to default avatar
}
```

**Response:**
```typescript
{
  success: true
}
```

---

## Database Operations

### User Registration with Random Avatar

When a new user registers, they automatically receive a random default avatar:

```typescript
import { createOrGetUser } from "@/lib/supabase/users"

// Create user - avatar assigned automatically
const user = await createOrGetUser(walletAddress, {
  name: "John Doe",
  email: "john@example.com",
  // avatar_url is auto-assigned if not provided
})
```

**Implementation:**
```typescript
// In lib/supabase/users.ts
import { getRandomAvatar } from "@/lib/constants/default-avatars"

const randomAvatar = getRandomAvatar()
const user = {
  wallet_address: walletAddress,
  avatar_url: metadata?.avatar_url || randomAvatar.url,
  // ... other fields
}
```

### Update User Avatar

```typescript
import { updateUser } from "@/lib/supabase/users"

await updateUser(walletAddress, {
  avatar_url: newAvatarUrl
})
```

---

## Storage Helper Functions

All storage operations are available in `lib/supabase/storage.ts`:

### Avatar Upload
```typescript
import { uploadUserAvatar } from "@/lib/supabase/storage"

const result = await uploadUserAvatar(userId, file)
// Returns: { url: string, path: string }
```

### Delete Avatar
```typescript
import { deleteUserAvatar } from "@/lib/supabase/storage"

await deleteUserAvatar(userId, filePath)
```

### List User Avatars
```typescript
import { listUserAvatars } from "@/lib/supabase/storage"

const avatars = await listUserAvatars(userId)
// Returns: string[] (filenames)
```

### Cleanup Old Avatars
```typescript
import { deleteOldUserAvatars } from "@/lib/supabase/storage"

// Delete all avatars except the specified one
await deleteOldUserAvatars(userId, "avatar-123.png")
```

### Validate Avatar File
```typescript
import { validateAvatarFile } from "@/lib/supabase/storage"

const validation = validateAvatarFile(file)
if (!validation.valid) {
  console.error(validation.error)
}
```

---

## Default Avatars Configuration

Default avatars are configured in `lib/constants/default-avatars.ts`:

```typescript
import {
  DEFAULT_AVATARS,      // Array of all default avatars
  DEFAULT_AVATAR_URL,   // Fallback placeholder avatar
  getRandomAvatar,      // Get random default avatar
  getAvatarById,        // Get specific avatar by ID
  getAllAvatars,        // Get all available avatars
  isDefaultAvatar,      // Check if URL is a default avatar
} from "@/lib/constants/default-avatars"
```

### Add New Default Avatar

1. Upload image to `profile-images` bucket in Supabase
2. Add entry to `DEFAULT_AVATARS` array:

```typescript
{
  id: 'new-avatar',
  name: 'New Avatar',
  url: 'https://your-project.supabase.co/storage/v1/object/public/profile-images/new-avatar.png',
  description: 'Description of the avatar'
}
```

---

## Integration in Settings Page

The avatar management is integrated into the Settings page (`app/settings/page.tsx`):

```tsx
import { AvatarSelector, AvatarUpload } from "@/components/profile"
import { updateUser } from "@/lib/supabase/users"

function SettingsPage() {
  const [showAvatarUpload, setShowAvatarUpload] = useState(false)
  const [currentAvatar, setCurrentAvatar] = useState(user.avatar_url)

  const handleAvatarSelect = async (avatarUrl: string) => {
    setCurrentAvatar(avatarUrl)
    await updateUser(wallet.address, { avatar_url: avatarUrl })
  }

  const handleAvatarUploadSuccess = (avatarUrl: string) => {
    setCurrentAvatar(avatarUrl)
    setShowAvatarUpload(false)
  }

  return (
    <div className="space-y-4">
      {showAvatarUpload ? (
        <AvatarUpload
          userId={user.id}
          currentAvatar={currentAvatar}
          onUploadSuccess={handleAvatarUploadSuccess}
          onCancel={() => setShowAvatarUpload(false)}
        />
      ) : (
        <AvatarSelector
          currentAvatar={currentAvatar}
          onAvatarSelect={handleAvatarSelect}
          onUploadClick={() => setShowAvatarUpload(true)}
        />
      )}
    </div>
  )
}
```

---

## Security Considerations

### Storage Policies
- **Row Level Security (RLS)** enforced on all buckets
- Users can only upload to their own folder
- Public read access for profile display
- Authenticated write access with folder restrictions

### File Validation
- **Type checking**: Only PNG, JPG, WEBP allowed
- **Size limits**: 2MB for user uploads, 5MB for defaults
- **Server-side validation**: Double-checked in API route
- **Client-side validation**: Immediate feedback

### Path Security
- User folders use UUID for path isolation
- No directory traversal vulnerabilities
- File names sanitized with timestamps

---

## Testing

### Test Avatar Upload
```typescript
// Test file validation
const file = new File(["content"], "avatar.png", { type: "image/png" })
const validation = validateAvatarFile(file)
expect(validation.valid).toBe(true)

// Test upload
const result = await uploadUserAvatar("user-123", file)
expect(result.url).toContain("user-avatars/user-123/")
```

### Test Random Assignment
```typescript
const avatar = getRandomAvatar()
expect(DEFAULT_AVATARS).toContain(avatar)
expect(avatar.url).toBeTruthy()
```

---

## Troubleshooting

### Avatar Not Displaying
- Check that the Supabase bucket is public
- Verify the URL is correct
- Check CORS settings in Supabase dashboard
- Ensure storage policies allow public read access

### Upload Failing
- Verify user is authenticated
- Check file size and type
- Ensure `NEXT_PUBLIC_SUPABASE_URL` is set
- Check bucket permissions in Supabase

### Random Avatar Not Assigned
- Ensure `getRandomAvatar()` is imported correctly
- Check that `DEFAULT_AVATARS` array is populated
- Verify Supabase URLs are correct in constants

---

## Best Practices

1. **Always validate files** on both client and server
2. **Cleanup old avatars** when uploading new ones
3. **Use optimized images** (compress before upload)
4. **Handle errors gracefully** with user feedback
5. **Show loading states** during upload
6. **Provide fallback avatars** for error cases

---

## Future Enhancements

- [ ] Avatar cropping/editing before upload
- [ ] Multiple avatar sizes (thumbnail, medium, large)
- [ ] Avatar generation from user initials
- [ ] Integration with NFT profile pictures
- [ ] Avatar animation support (GIF, APNG)
- [ ] Avatar history/rollback
- [ ] Social avatar imports (Twitter, GitHub, etc.)

---

## Related Documentation

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Profile Images Upload Guide](./profile-images-upload-guide.md)
- [Thirdweb Integration](./thirdweb-integration.md)
- [Authentication Setup](./authentication-setup.md)

---

**Last Updated:** 2025-11-07
**Version:** 1.0.0
