# Profile Images Upload to Supabase Guide

This guide will help you upload all profile images to Supabase storage so they can be used as default and template profile pictures for users.

## Images to Upload

We have the following profile images ready to upload:

1. `public/avatars/user_joyboy.png` - Joyboy avatar
2. `public/avatars/user_krimson.png` - Krimson avatar
3. `public/avatars/user_mati.png` - Mati avatar
4. `public/avatars/user_pek.png` - Pek avatar
5. `public/placeholder-user.jpg` - Default placeholder

---

## Method 1: Using the Upload Script (Recommended)

### Prerequisites

You need to set up environment variables first:

1. **Get your Supabase Service Role Key:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to **Settings** → **API**
   - Copy the **service_role key** (⚠️ Keep this secret!)

2. **Create `.env.local` file:**
   ```bash
   # In your project root, create .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### Run the Upload Script

```bash
# Make sure dependencies are installed
npm install

# Run the upload script
npx tsx scripts/upload-profile-images.ts
```

The script will:
- ✅ Create a `profile-images` storage bucket
- ✅ Upload all 5 profile images
- ✅ Make them publicly accessible
- ✅ Print the public URLs

---

## Method 2: Manual Upload via Supabase Dashboard

If you prefer to upload manually or the script isn't working:

### Step 1: Create Storage Bucket

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **New bucket**
5. Configure the bucket:
   - **Name:** `profile-images`
   - **Public bucket:** ✅ Enable this
   - **File size limit:** 5 MB
   - **Allowed MIME types:** `image/png, image/jpeg, image/jpg, image/webp`
6. Click **Create bucket**

### Step 2: Upload Images

1. Click on the `profile-images` bucket
2. Click **Upload file**
3. Upload each of these files from your local project:
   - `public/avatars/user_joyboy.png`
   - `public/avatars/user_krimson.png`
   - `public/avatars/user_mati.png`
   - `public/avatars/user_pek.png`
   - `public/placeholder-user.jpg`

### Step 3: Make Files Public

The bucket is already public, so files will be automatically accessible via public URLs.

### Step 4: Get Public URLs

For each uploaded file, the public URL will be:
```
https://your-project.supabase.co/storage/v1/object/public/profile-images/filename.png
```

---

## Method 3: Using SQL Migration

You can also set up the storage bucket using SQL:

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this SQL:

```sql
-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy for public access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'profile-images' );

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'profile-images' AND auth.role() = 'authenticated' );
```

3. Then upload files manually via the dashboard (Method 2, Step 2)

---

## After Upload: Update Your App

Once images are uploaded, you'll want to use them in your application.

### Step 1: Create Constants File

Create or update `lib/constants/default-avatars.ts`:

```typescript
/**
 * Default profile avatars stored in Supabase Storage
 */
export const DEFAULT_AVATARS = [
  {
    id: 'joyboy',
    name: 'Joyboy',
    url: 'https://your-project.supabase.co/storage/v1/object/public/profile-images/user_joyboy.png'
  },
  {
    id: 'krimson',
    name: 'Krimson',
    url: 'https://your-project.supabase.co/storage/v1/object/public/profile-images/user_krimson.png'
  },
  {
    id: 'mati',
    name: 'Mati',
    url: 'https://your-project.supabase.co/storage/v1/object/public/profile-images/user_mati.png'
  },
  {
    id: 'pek',
    name: 'Pek',
    url: 'https://your-project.supabase.co/storage/v1/object/public/profile-images/user_pek.png'
  },
  {
    id: 'placeholder',
    name: 'Default',
    url: 'https://your-project.supabase.co/storage/v1/object/public/profile-images/placeholder-user.jpg'
  }
]

export const DEFAULT_AVATAR_URL = DEFAULT_AVATARS.find(a => a.id === 'placeholder')?.url || ''

/**
 * Get a random default avatar
 */
export function getRandomAvatar() {
  const avatars = DEFAULT_AVATARS.filter(a => a.id !== 'placeholder')
  return avatars[Math.floor(Math.random() * avatars.length)]
}
```

### Step 2: Use in Profile Component

```typescript
import { DEFAULT_AVATARS, getRandomAvatar } from '@/lib/constants/default-avatars'

// In your profile creation/update component
function ProfilePictureSelector() {
  const [selectedAvatar, setSelectedAvatar] = useState('')

  return (
    <div className="grid grid-cols-5 gap-4">
      {DEFAULT_AVATARS.map(avatar => (
        <button
          key={avatar.id}
          onClick={() => setSelectedAvatar(avatar.url)}
          className="relative aspect-square rounded-full overflow-hidden"
        >
          <img src={avatar.url} alt={avatar.name} />
        </button>
      ))}
    </div>
  )
}
```

### Step 3: Set Default Avatar on User Creation

Update your user creation logic to assign a random default avatar:

```typescript
import { getRandomAvatar, DEFAULT_AVATAR_URL } from '@/lib/constants/default-avatars'

// When creating a new user
const defaultAvatar = getRandomAvatar()
await supabase.from('users').insert({
  wallet_address: address,
  avatar_url: defaultAvatar.url, // or DEFAULT_AVATAR_URL for placeholder
  // ... other fields
})
```

---

## Verification

After uploading, verify everything works:

1. ✅ Visit the public URLs in your browser
2. ✅ Images load without authentication
3. ✅ Images display in your app's profile selector
4. ✅ New users get assigned a default avatar

---

## Troubleshooting

### Images not loading?
- Check that the bucket is set to **public**
- Verify the URLs are correct
- Check browser console for CORS errors

### Upload failing?
- Verify your service role key is correct
- Check file sizes are under 5MB
- Ensure MIME types are allowed

### Access denied?
- Make sure storage policies are set correctly
- Verify bucket permissions in Supabase Dashboard

---

## Security Notes

⚠️ **Important:**
- Never commit `.env.local` to git
- Keep your Service Role Key secret
- Only use Service Role Key on the server-side
- Client-side should use the Anon Key

---

## Next Steps

After uploading profile images:

1. ✅ Create the constants file with image URLs
2. ✅ Implement profile picture selector in UI
3. ✅ Update user creation flow to assign default avatars
4. ✅ Add profile picture update functionality
5. ✅ Consider adding custom upload feature for users

---

**Need help?** Check the [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
