import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          subscription_tier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          subscription_tier?: string
        }
        Update: {
          full_name?: string | null
          subscription_tier?: string
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
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: string
          notifications_enabled: boolean
          favorite_experts: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          theme?: string
          notifications_enabled?: boolean
          favorite_experts?: string[]
        }
        Update: {
          theme?: string
          notifications_enabled?: boolean
          favorite_experts?: string[]
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
      usage_analytics: {
        Row: {
          id: string
          user_id: string
          event_type: string
          event_data: any
          created_at: string
        }
        Insert: {
          user_id: string
          event_type: string
          event_data?: any
        }
        Update: {
          event_type?: string
          event_data?: any
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan_id: string | null
          status: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_id?: string | null
          status?: string | null
          current_period_end?: string | null
        }
        Update: {
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_id?: string | null
          status?: string | null
          current_period_end?: string | null
        }
      }
    }
  }
}

// Client-side Supabase client (for use in React components)
export function createSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Server-side Supabase client (for API routes)
export function createSupabaseServerClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}