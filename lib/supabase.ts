import { createBrowserClient, createServerClient } from '@supabase/ssr' 
import type { Database } from './types' // adjust path if needed

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
    }
  }
}

// Client-side Supabase client
export const createSupabaseClient = () => {
  return createBrowserClient<Database>( 
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   ) 
  } 
  
// Server-side Supabase client (API routes, server components)
 export const createSupabaseServerClient = () => {
  const cookieStore = cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
     { 
      cookies: {
        get(name: string) {
           return cookieStore.get(name)?.value 
        } 
      } 
    } 
  ) 
}