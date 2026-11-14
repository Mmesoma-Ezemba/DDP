# Profile Images Setup - Quick Start

This document provides a quick reference for setting up profile images in Supabase.

## 📦 What's Been Prepared

All the infrastructure is ready for you:

✅ **Upload Script**: `scripts/upload-profile-images.ts`  
✅ **SQL Migration**: `supabase/migrations/002_storage_setup.sql`  
✅ **Constants File**: `lib/constants/default-avatars.ts`  
✅ **Update Script**: `scripts/update-avatar-constants.ts`  
✅ **Detailed Guide**: `docs/profile-images-upload-guide.md`

## 🚀 Quick Setup (Choose One Method)

### Method A: Automated Upload (Recommended)

**Prerequisites:**
```bash
# 1. Get your Supabase credentials:
#    - Go to https://supabase.com/dashboard
#    - Settings → API
#    - Copy: Project URL and Service Role Key

# 2. Create .env.local (if not exists):
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Run Upload:**
```bash
npm install                                # Install dependencies
npx tsx scripts/upload-profile-images.ts   # Upload all images
npx tsx scripts/update-avatar-constants.ts # Update constants with URLs
```

Done! ✨

---

### Method B: Manual Upload via Dashboard

1. **Run SQL Migration:**
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents of `supabase/migrations/002_storage_setup.sql`
   - Execute the SQL

2. **Upload Images:**
   - Go to Storage → profile-images bucket
   - Upload these files:
     - `public/avatars/user_joyboy.png`
     - `public/avatars/user_krimson.png`
     - `public/avatars/user_mati.png`
     - `public/avatars/user_pek.png`
     - `public/placeholder-user.jpg`

3. **Update Constants:**
   ```bash
   npx tsx scripts/update-avatar-constants.ts
   ```

Done! ✨

---

## 📋 What Gets Created

### Storage Buckets

1. **profile-images** (public)
   - Default avatars for users to select
   - 5MB file size limit
   - Public access

2. **user-avatars** (public)
   - Custom uploaded avatars
   - 2MB file size limit
   - User-specific folders

### Files Uploaded

| File | Description | Size |
|------|-------------|------|
| user_joyboy.png | Joyboy avatar | ~50KB |
| user_krimson.png | Krimson avatar | ~50KB |
| user_mati.png | Mati avatar | ~50KB |
| user_pek.png | Pek avatar | ~50KB |
| placeholder-user.jpg | Default placeholder | ~20KB |

### Public URLs Format

After upload, images are accessible at:
```
https://YOUR_PROJECT.supabase.co/storage/v1/object/public/profile-images/FILENAME.png
```

---

## 🧪 Testing

After setup, verify everything works:

```bash
# 1. Check URLs are accessible
curl -I https://your-project.supabase.co/storage/v1/object/public/profile-images/user_joyboy.png

# Expected: HTTP 200 OK

# 2. Test in your app
npm run dev

# Navigate to profile page and check avatar selector
```

---

## 💻 Usage in Code

### Import and Use Default Avatars

```typescript
import { 
  DEFAULT_AVATARS, 
  DEFAULT_AVATAR_URL,
  getRandomAvatar 
} from '@/lib/constants/default-avatars'

// Get all avatars for display
const avatars = DEFAULT_AVATARS

// Get a random avatar for new user
const randomAvatar = getRandomAvatar()

// Use default placeholder
const placeholder = DEFAULT_AVATAR_URL
```

### Create Profile Picture Selector Component

```typescript
import { DEFAULT_AVATARS } from '@/lib/constants/default-avatars'

function AvatarSelector({ onSelect }: { onSelect: (url: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {DEFAULT_AVATARS.map(avatar => (
        <button
          key={avatar.id}
          onClick={() => onSelect(avatar.url)}
          className="aspect-square rounded-full overflow-hidden hover:ring-2"
        >
          <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
        </button>
      ))}
    </div>
  )
}
```

### Assign Random Avatar on User Creation

```typescript
import { getRandomAvatar } from '@/lib/constants/default-avatars'
import { supabase } from '@/lib/supabase/client'

async function createUser(walletAddress: string) {
  const avatar = getRandomAvatar()
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      wallet_address: walletAddress,
      avatar_url: avatar.url,
      name: `User_${walletAddress.slice(0, 6)}`,
    })
    
  return { data, error }
}
```

---

## 🔧 Troubleshooting

### Script fails with "Missing environment variables"
→ Create `.env.local` with Supabase credentials (see Method A above)

### Images upload but URLs return 404
→ Check bucket is set to `public: true` in Supabase Dashboard → Storage

### "Bucket already exists" error
→ Safe to ignore, the bucket already exists and will be used

### CORS errors when loading images
→ Verify bucket is public and has correct MIME types configured

---

## 📚 More Information

- **Detailed Guide**: See `docs/profile-images-upload-guide.md`
- **Supabase Storage Docs**: https://supabase.com/docs/guides/storage
- **Migration Details**: See `supabase/migrations/002_storage_setup.sql`

---

## 🎯 Next Steps After Setup

1. ✅ Implement avatar selector UI in profile settings
2. ✅ Add custom avatar upload feature
3. ✅ Update user creation flow to assign random avatars
4. ✅ Add avatar display in navbar/profile sections
5. ✅ Consider image optimization/CDN if needed

---

**Quick Help:**

- Can't run scripts? → Use Method B (manual upload)
- Need service role key? → Supabase Dashboard → Settings → API
- Images not loading? → Check browser console for errors
- Need help? → Check `docs/profile-images-upload-guide.md`

