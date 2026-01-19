# Fix: "Failed to delete user: Database error deleting user"

## The Problem

When trying to delete a user in Supabase Dashboard, you get:
```
Failed to delete user: Database error deleting user
```

This happens because your database has foreign key constraints that prevent deletion.

## Root Cause

Your tables have `user_id` columns that reference `auth.users.id`:

- **profiles** → references `auth.users(id)`
- **subscriptions** → has `user_id` column
- **conversations** → has `user_id` column
- **goals** → has `user_id` column

When you try to delete a user from `auth.users`, PostgreSQL blocks it because related rows exist in these tables, and the foreign keys don't have `ON DELETE CASCADE`.

## The Fix

You need to add `ON DELETE CASCADE` to all foreign keys. This tells PostgreSQL:
> "When a user is deleted from auth.users, automatically delete all related rows in other tables."

## How to Apply the Fix

### Option 1: Run SQL in Supabase SQL Editor (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click **SQL Editor** in the left sidebar

2. **Copy the migration SQL**
   - Open the file: `supabase/migrations/add_cascade_delete.sql`
   - Copy all the SQL code

3. **Paste and run in SQL Editor**
   - Paste the SQL into the editor
   - Click **Run** (or press Ctrl+Enter)

4. **Verify it worked**
   - You should see success messages for each table
   - No errors should appear

5. **Test user deletion**
   - Go to **Authentication** → **Users**
   - Try deleting a test user
   - It should work now without errors

### Option 2: Manual SQL Commands

If you prefer to do it manually, run these commands one by one in SQL Editor:

```sql
-- 1. Fix profiles table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Fix subscriptions table
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
ALTER TABLE subscriptions
ADD CONSTRAINT subscriptions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Fix conversations table
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_user_id_fkey;
ALTER TABLE conversations
ADD CONSTRAINT conversations_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Fix goals table
ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_user_id_fkey;
ALTER TABLE goals
ADD CONSTRAINT goals_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

## What This Does

**Before (broken):**
```
Try to delete user → PostgreSQL checks foreign keys →
Related rows exist in profiles/conversations/goals →
ERROR: Cannot delete user
```

**After (fixed with CASCADE):**
```
Delete user → PostgreSQL checks foreign keys →
Automatically deletes related rows in all tables →
User and all their data deleted successfully ✅
```

## Data That Gets Deleted

When you delete a user, **all their data is automatically deleted**:

- ✅ User's profile
- ✅ User's subscriptions
- ✅ User's conversations
- ✅ User's goals
- ✅ The auth.users record

This is the correct behavior for GDPR compliance and data cleanup.

## Verification

After running the migration, verify it worked:

```sql
-- Run this query to check all foreign keys have CASCADE
SELECT
    tc.table_name,
    kcu.column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND kcu.table_schema = 'public'
  AND rc.delete_rule = 'CASCADE';
```

You should see all 4 tables listed with `delete_rule = CASCADE`.

## Testing

1. **Create a test user** in Supabase Dashboard → Authentication → Users
2. **Verify the user has data** (profile should auto-create via trigger)
3. **Delete the user** from Authentication → Users
4. **Should succeed** without error
5. **Verify data is gone** - check that profile was also deleted

## Important Notes

⚠️ **This deletes ALL user data permanently**
- Make sure you understand that deleting a user will cascade to all related tables
- This is typically the desired behavior for user account deletion
- If you need to preserve data, archive users instead of deleting them

✅ **This is GDPR compliant**
- Users have the right to be forgotten
- Cascade delete ensures all personal data is removed

## If It Still Doesn't Work

If you still get errors after running the migration:

1. **Check for other tables**
   - You might have other tables with `user_id` columns
   - Run this query to find them:
   ```sql
   SELECT table_name, column_name
   FROM information_schema.columns
   WHERE column_name = 'user_id'
   AND table_schema = 'public';
   ```

2. **Check constraint names**
   - The constraint might have a different name
   - Run this to see all constraints:
   ```sql
   SELECT constraint_name, table_name
   FROM information_schema.table_constraints
   WHERE constraint_type = 'FOREIGN KEY'
   AND table_schema = 'public';
   ```

3. **Manual deletion**
   - As a last resort, manually delete related rows first:
   ```sql
   DELETE FROM goals WHERE user_id = 'user-id-here';
   DELETE FROM conversations WHERE user_id = 'user-id-here';
   DELETE FROM subscriptions WHERE user_id = 'user-id-here';
   DELETE FROM profiles WHERE id = 'user-id-here';
   -- Then delete from Supabase Auth dashboard
   ```

## Files

- **SQL Migration**: `supabase/migrations/add_cascade_delete.sql`
- **This Guide**: `FIX_USER_DELETE_ERROR.md`
