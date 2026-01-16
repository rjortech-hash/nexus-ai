'use client'

import { useState, useEffect } from 'react'
import { Brain, MessageSquare, TrendingUp, Users, Calendar } from 'lucide-react'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Analytics {
  totalConversations: number
  totalMessages: number
  favoriteExpert: string
  streakDays: number
  thisWeekMessages: number
  lastWeekMessages: number
}

interface Conversation {
  id: string
  user_id: string
  expert_id: string
  title: string
  messages: any[]
  created_at: string
  updated_at: string
}

const experts = [
  { id: 'therapist', name: 'Dr. Sarah Chen', avatar: '🧠' },
  { id: 'business', name: 'Marcus Reid', avatar: '💼' },
  { id: 'wellness', name: 'Coach Jamie', avatar: '💪' },
  { id: 'creative', name: 'Alex Rivera', avatar: '🎨' },
]

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalConversations: 0,
    totalMessages: 0,
    favoriteExpert: 'therapist',
    streakDays: 0,
    thisWeekMessages: 0,
    lastWeekMessages: 0,
  })
  const [expertUsage, setExpertUsage] = useState<Record<string, number>>({})
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
        loadAnalytics(user.id)
      }
    }
    checkUser()
  }, [])

  const loadAnalytics = async (userId: string) => {
    setLoading(true)

    try {
      // Get conversations with proper typing
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)

      if (error) {
        console.error('Error loading analytics:', error)
        setLoading(false)
        return
      }

      // Type cast conversations
      const typedConversations = (conversations || []) as Conversation[]

      if (typedConversations.length > 0) {
        // Calculate total messages
        const totalMessages = typedConversations.reduce((sum, conv) => {
          const messageCount = Array.isArray(conv.messages) ? conv.messages.length : 0
          return sum + messageCount
        }, 0)

        // Calculate expert usage
        const usage: Record<string, number> = {}
        typedConversations.forEach(conv => {
          usage[conv.expert_id] = (usage[conv.expert_id] || 0) + 1
        })

        // Find favorite expert
        const favoriteExpert = Object.entries(usage).sort((a, b) => b[1] - a[1])[0]?.[0] || 'therapist'

        // Calculate this week vs last week
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const twoWeeksAgo = new Date()
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

        const thisWeekConvs = typedConversations.filter(c => new Date(c.updated_at) > oneWeekAgo)
        const lastWeekConvs = typedConversations.filter(c => 
          new Date(c.updated_at) > twoWeeksAgo && new Date(c.updated_at) <= oneWeekAgo
        )

        const thisWeekMessages = thisWeekConvs.reduce((sum, c) => {
          const messageCount = Array.isArray(c.messages) ? c.messages.length : 0
          return sum + messageCount
        }, 0)

        const lastWeekMessages = lastWeekConvs.reduce((sum, c) => {
          const messageCount = Array.isArray(c.messages) ? c.messages.length : 0
          return sum + messageCount
        }, 0)

        // Calculate streak (simplified - counts days with activity)
        const activityDates = typedConversations
          .map(c => new Date(c.updated_at).toDateString())
          .filter((date, i, arr) => arr.indexOf(date) === i)
        
        setAnalytics({
          totalConversations: typedConversations.length,
          totalMessages,
          favoriteExpert,
          streakDays: activityDates.length,
          thisWeekMessages,
          lastWeekMessages,
        })

        setExpertUsage(usage)
      }
    } catch (error) {
      console.error('Error in loadAnalytics:', error)
    }

    setLoading(false)
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Brain className="w-16 h-16 text-purple-500 animate-pulse" />
      </div>
    )
  }

  const favoriteExpertData = experts.find(e => e.id === analytics.favoriteExpert)
  const growthPercent = analytics.lastWeekMessages > 0
    ? Math.round(((analytics.thisWeekMessages - analytics.lastWeekMessages) / analytics.lastWeekMessages) * 100)
    : 100

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="bg-black/40 backdrop-blur-lg border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/chat" className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold gradient-text">NEXUS</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/chat">
              <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-semibold hover:bg-white/10">
                Chat
              </button>
            </Link>
            <Link href="/goals">
              <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-semibold hover:bg-white/10">
                Goals
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Insights</h1>
          <p className="text-gray-400">Track your growth and engagement</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<MessageSquare className="w-8 h-8" />}
            label="Total Messages"
            value={analytics.totalMessages.toString()}
            change={null}
          />
          <StatCard
            icon={<Users className="w-8 h-8" />}
            label="Conversations"
            value={analytics.totalConversations.toString()}
            change={null}
          />
          <StatCard
            icon={<Calendar className="w-8 h-8" />}
            label="Active Days"
            value={analytics.streakDays.toString()}
            change={null}
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            label="This Week"
            value={analytics.thisWeekMessages.toString()}
            change={growthPercent}
          />
        </div>

        {/* Expert Usage */}
        <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-8 rounded-2xl border border-purple-500/30 mb-8">
          <h2 className="text-2xl font-bold mb-6">Expert Usage</h2>
          <div className="space-y-4">
            {experts.map(expert => {
              const usage = expertUsage[expert.id] || 0
              const percentage = analytics.totalConversations > 0
                ? (usage / analytics.totalConversations) * 100
                : 0

              return (
                <div key={expert.id}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{expert.avatar}</span>
                      <span className="font-semibold">{expert.name}</span>
                    </div>
                    <span className="text-purple-400 font-semibold">
                      {usage} conversations
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Favorite Expert */}
        {favoriteExpertData && (
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-8 rounded-2xl border border-purple-500/30 text-center">
            <h2 className="text-2xl font-bold mb-4">Your Go-To Expert</h2>
            <div className="text-6xl mb-4">{favoriteExpertData.avatar}</div>
            <h3 className="text-2xl font-bold mb-2">{favoriteExpertData.name}</h3>
            <p className="text-gray-400">
              You've connected most with this expert
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, change }: {
  icon: React.ReactNode
  label: string
  value: string
  change: number | null
}) {
  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-6 rounded-2xl border border-white/10">
      <div className="text-purple-400 mb-3">{icon}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-400 flex items-center justify-between">
        <span>{label}</span>
        {change !== null && (
          <span className={change >= 0 ? 'text-green-400' : 'text-red-400'}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
    </div>
  )
}