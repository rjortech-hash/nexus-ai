-- Migration: Add ON DELETE CASCADE to all foreign keys referencing auth.users
-- This allows users to be deleted from Supabase Auth without database errors

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
-- The profiles.id already has ON DELETE CASCADE from the migration in LOGIN_DEBUG_GUIDE.md
-- But let's ensure it's correct

-- Drop existing constraint if it exists (may have different name)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'profiles_id_fkey'
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
    END IF;
END $$;

-- Add the constraint with CASCADE
ALTER TABLE profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- ============================================================================
-- 2. SUBSCRIPTIONS TABLE
-- ============================================================================
-- Drop existing foreign key constraint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'subscriptions_user_id_fkey'
        AND table_name = 'subscriptions'
    ) THEN
        ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_user_id_fkey;
    END IF;
END $$;

-- Add the constraint with CASCADE
ALTER TABLE subscriptions
ADD CONSTRAINT subscriptions_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- ============================================================================
-- 3. CONVERSATIONS TABLE
-- ============================================================================
-- Drop existing foreign key constraint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'conversations_user_id_fkey'
        AND table_name = 'conversations'
    ) THEN
        ALTER TABLE conversations DROP CONSTRAINT conversations_user_id_fkey;
    END IF;
END $$;

-- Add the constraint with CASCADE
ALTER TABLE conversations
ADD CONSTRAINT conversations_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- ============================================================================
-- 4. GOALS TABLE
-- ============================================================================
-- Drop existing foreign key constraint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'goals_user_id_fkey'
        AND table_name = 'goals'
    ) THEN
        ALTER TABLE goals DROP CONSTRAINT goals_user_id_fkey;
    END IF;
END $$;

-- Add the constraint with CASCADE
ALTER TABLE goals
ADD CONSTRAINT goals_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- This query shows all foreign keys and their delete actions
-- Run this to verify CASCADE is set correctly:
/*
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'users'
  AND ccu.table_schema = 'auth'
ORDER BY tc.table_name;
*/
