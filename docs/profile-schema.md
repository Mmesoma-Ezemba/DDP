# Profile Information Database Schema

This document describes the database schema for user profile information in the Decentralized Death Protocol (DDP).

## Table Structure

### `profiles` Table

The main table for storing user profile information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier for the profile |
| `wallet_address` | TEXT | UNIQUE, NOT NULL | User's wallet address (lowercase) |
| `email` | TEXT | NULLABLE | User's email address |
| `username` | TEXT | UNIQUE | User's username (lowercase, alphanumeric + underscore) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Profile creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| `last_active` | TIMESTAMPTZ | DEFAULT NOW() | Last activity timestamp |
| `metadata` | JSONB | DEFAULT '{}' | Profile metadata (see structure below) |

## Metadata JSONB Structure

The `metadata` column stores profile-specific information as JSONB:

```json
{
  "name": "string",              // Display name (required for display)
  "avatar_url": "string",        // Profile picture URL
  "bio": "string",               // User biography (max 500 chars)
  "website": "string",           // Personal website URL
  "twitter": "string",           // Twitter handle (e.g., "@username")
  "location": "string",          // User location (e.g., "City, Country")
  "achievements": [              // Array of achievement objects
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "icon": "string",
      "unlockedAt": "string",    // ISO timestamp
      "rarity": "string"         // "common" | "rare" | "epic" | "legendary"
    }
  ],
  "settings": {                  // User preferences (optional)
    "notifications": {},
    "privacy": {},
    "display": {}
  }
}
```

## Indexes

The following indexes are created for optimal query performance:

1. **`idx_profiles_wallet_address`** - Index on `wallet_address` (lowercase) for fast wallet lookups
2. **`idx_profiles_username`** - Index on `username` (lowercase) for fast username lookups
3. **`idx_profiles_email`** - Index on `email` (lowercase) for fast email lookups
4. **`idx_profiles_metadata_gin`** - GIN index on `metadata` JSONB for fast metadata queries
5. **`idx_profiles_wallet_username`** - Composite index for common queries

## Constraints

1. **`profiles_username_key`** - Unique constraint on `username`
2. **`profiles_username_format_check`** - Check constraint ensuring username format: `^[a-z0-9_]+$`

## Helper Functions

### `get_profile_by_wallet(wallet_addr TEXT)`

Retrieves a profile by wallet address.

**Usage:**
```sql
SELECT * FROM get_profile_by_wallet('0x1234...');
```

### `update_profile_metadata(wallet_addr TEXT, metadata_updates JSONB)`

Updates profile metadata by merging with existing metadata.

**Usage:**
```sql
SELECT update_profile_metadata(
  '0x1234...',
  '{"name": "New Name", "bio": "New bio"}'::jsonb
);
```

### `check_username_unique(new_username TEXT, exclude_wallet TEXT)`

Checks if a username is available (unique).

**Usage:**
```sql
SELECT check_username_unique('newusername', '0x1234...');
-- Returns true if username is available, false otherwise
```

## Views

### `profile_public`

A view that exposes only public profile information (excludes sensitive data).

**Columns:**
- `id`
- `wallet_address`
- `username`
- `display_name` (from metadata->>'name')
- `avatar_url` (from metadata->>'avatar_url')
- `bio` (from metadata->>'bio')
- `website` (from metadata->>'website')
- `twitter` (from metadata->>'twitter')
- `location` (from metadata->>'location')
- `created_at`
- `updated_at`

**Usage:**
```sql
SELECT * FROM profile_public WHERE username = 'username';
```

## Row Level Security (RLS)

The following RLS policies are in place:

1. **Read Access** - All users can read all profiles (for public display)
2. **Insert Access** - All users can create profiles (for signup)
3. **Update Access** - Users can update their own profile (verified by wallet_address)

## Triggers

1. **`update_profiles_updated_at`** - Automatically updates `updated_at` timestamp on any update
2. **`update_profiles_last_active`** - Automatically updates `last_active` timestamp on any update

## API Integration

### Creating a Profile

When a user signs up, a profile is created with:
- `wallet_address` (from authentication)
- `username` (optional, can be set later)
- `metadata` (empty object `{}`)

### Updating Profile Information

Profile updates are handled through the `/api/profile` PATCH endpoint:

```typescript
PATCH /api/profile
Body: {
  displayName?: string,    // Stored in metadata.name
  username?: string,       // Stored in username column
  bio?: string,            // Stored in metadata.bio
  website?: string,        // Stored in metadata.website
  twitter?: string,        // Stored in metadata.twitter
  location?: string        // Stored in metadata.location
}
```

The API:
1. Validates the request (wallet authentication)
2. Merges updates with existing metadata
3. Updates the `username` column if provided
4. Updates the `metadata` JSONB column
5. Updates `updated_at` timestamp (via trigger)

## Validation Rules

### Username
- Must be lowercase
- Can only contain: `a-z`, `0-9`, `_`
- Must be unique across all profiles
- Maximum length: 30 characters

### Display Name
- Stored in `metadata.name`
- Maximum length: 50 characters
- Can contain any characters

### Bio
- Stored in `metadata.bio`
- Maximum length: 500 characters

### Website
- Stored in `metadata.website`
- Should be a valid URL format

### Twitter Handle
- Stored in `metadata.twitter`
- Maximum length: 50 characters
- Format: `@username` (optional @ prefix)

### Location
- Stored in `metadata.location`
- Maximum length: 100 characters
- Format: `City, Country` (recommended)

## Example Queries

### Get Full Profile
```sql
SELECT 
  id,
  wallet_address,
  email,
  username,
  metadata->>'name' AS display_name,
  metadata->>'avatar_url' AS avatar_url,
  metadata->>'bio' AS bio,
  metadata->>'website' AS website,
  metadata->>'twitter' AS twitter,
  metadata->>'location' AS location,
  created_at,
  updated_at,
  last_active
FROM public.profiles
WHERE LOWER(wallet_address) = LOWER('0x1234...');
```

### Update Profile Metadata
```sql
UPDATE public.profiles
SET 
  metadata = metadata || '{"name": "New Name", "bio": "New bio"}'::jsonb,
  updated_at = NOW()
WHERE LOWER(wallet_address) = LOWER('0x1234...');
```

### Check Username Availability
```sql
SELECT NOT EXISTS (
  SELECT 1 FROM public.profiles
  WHERE LOWER(username) = LOWER('newusername')
    AND LOWER(wallet_address) != LOWER('0x1234...')
) AS is_available;
```

## Migration Guide

To apply this schema to your Supabase database:

1. **Run the main schema first:**
   ```sql
   -- Run supabase-schema.sql
   ```

2. **Then run the profile schema:**
   ```sql
   -- Run supabase-profile-schema.sql
   ```

3. **Verify the schema:**
   ```sql
   -- Check table structure
   SELECT 
     table_name,
     column_name,
     data_type,
     is_nullable
   FROM information_schema.columns
   WHERE table_schema = 'public' 
     AND table_name = 'profiles'
   ORDER BY ordinal_position;
   
   -- Check indexes
   SELECT indexname, indexdef
   FROM pg_indexes
   WHERE tablename = 'profiles';
   
   -- Check constraints
   SELECT conname, contype, pg_get_constraintdef(oid)
   FROM pg_constraint
   WHERE conrelid = 'public.profiles'::regclass;
   ```

## Notes

- The `metadata` JSONB column allows flexible storage of profile information without schema changes
- All wallet addresses are stored in lowercase for consistency
- Usernames are also stored in lowercase
- The `updated_at` and `last_active` timestamps are automatically maintained by triggers
- RLS policies allow public read access but restrict updates to the profile owner

