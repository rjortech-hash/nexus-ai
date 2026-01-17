// lib/supabase.ts
import { createBrowserClient, createServerClient } from '@supabase/ssr'

// -----------------------------
// Database Type
// -----------------------------
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          stripe_customer_id?: string | null
          full_name: string | null
          subscription_tier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          stripe_customer_id?: string | null
          subscription_tier?: string
        }
        Update: {
          full_name?: string | null
          stripe_customer_id?: string | null
          subscription_tier?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          stripe_customer_id?: string
          updated_at?: string
        }
      }

      conversations: {
        Row: {
          id: string
          user_id: string
          expert_id: string
          title: string
          messages: any[]
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          expert_id: string
          title?: string
          messages?: any[]
        }
        Update: {
          title?: string
          messages?: any[]
        }
      }

      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          expert_id: string | null
          status: string
          progress: number
          target_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          title: string
          description?: string | null
          expert_id?: string | null
          status?: string
          progress?: number
          target_date?: string | null
        }
        Update: {
          title?: string
          description?: string | null
          status?: string
          progress?: number
          target_date?: string | null
        }
      }
    }
  }
}

// -----------------------------
// Client-side Supabase
// -----------------------------
export function createBrowserSupabase() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// -----------------------------
// Server-side Supabase
// -----------------------------
export function createServerSupabase() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )
}

// Legacy alias
export const createSupabaseServerClient = createServerSupabase
