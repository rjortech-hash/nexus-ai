'use client'

import { useState, useEffect } from 'react'
import { Brain, Plus, Trash2, Check, Target } from 'lucide-react'
import Link from 'next/link'
import { createBrowserSupabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Goal {
  id: string
  title: string
  description: string
  expert_id: string
  status: string
  progress: number
  target_date: string
  created_at: string
}

const experts = [
  { id: 'therapist', name: 'Dr. Sarah Chen', avatar: '🧠' },
  { id: 'business', name: 'Marcus Reid', avatar: '💼' },
  { id: 'wellness', name: 'Coach Jamie', avatar: '💪' },
  { id: 'creative', name: 'Alex Rivera', avatar: '🎨' },
]

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    expert_id: 'therapist',
    target_date: '',
  })
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserSupabase()
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
        loadGoals(user.id)
      }
    }
    checkUser()
  }, [])

  const loadGoals = async (userId: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data) {
      setGoals(data)
    }
    setLoading(false)
  }

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const { data, error } = await (supabase
      .from('goals') as any)
      .insert({
        user_id: user.id,
        ...newGoal,
      })
      .select()
      .single()

    if (data) {
      setGoals([data, ...goals])
      setNewGoal({ title: '', description: '', expert_id: 'therapist', target_date: '' })
      setShowAddForm(false)
    }
  }

  const handleUpdateProgress = async (goalId: string, newProgress: number) => {
    await (supabase
      .from('goals') as any)
      .update({ progress: newProgress })
      .eq('id', goalId)

    setGoals(goals.map(g => g.id === goalId ? { ...g, progress: newProgress } : g))
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      await (supabase.from('goals') as any).delete().eq('id', goalId)
      setGoals(goals.filter(g => g.id !== goalId))
    }
  }

  const handleCompleteGoal = async (goalId: string) => {
    await (supabase
      .from('goals') as any)
      .update({ status: 'completed', progress: 100 })
      .eq('id', goalId)

    setGoals(goals.map(g => g.id === goalId ? { ...g, status: 'completed', progress: 100 } : g))
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Brain className="w-16 h-16 text-purple-500 animate-pulse" />
      </div>
    )
  }

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
            <Link href="/pricing">
              <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-semibold hover:bg-white/10">
                Upgrade
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Goals</h1>
            <p className="text-gray-400">Track progress with expert guidance</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Goal
          </button>
        </div>

        {/* Add Goal Form */}
        {showAddForm && (
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-6 rounded-2xl border border-purple-500/30 mb-8">
            <h3 className="text-xl font-bold mb-4">Create New Goal</h3>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                  placeholder="e.g., Launch my startup by Q2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white resize-none"
                  rows={3}
                  placeholder="What do you want to achieve?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Choose Expert</label>
                  <select
                    value={newGoal.expert_id}
                    onChange={(e) => setNewGoal({ ...newGoal, expert_id: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                  >
                    {experts.map(expert => (
                      <option key={expert.id} value={expert.id}>
                        {expert.avatar} {expert.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Target Date</label>
                  <input
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-lg font-semibold"
                >
                  Create Goal
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 bg-white/5 border border-white/10 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Goals List */}
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-20">
              <Target className="w-16 h-16 text-purple-500/50 mx-auto mb-4" />
              <p className="text-gray-400">No goals yet. Create your first one!</p>
            </div>
          ) : (
            goals.map((goal) => {
              const expert = experts.find(e => e.id === goal.expert_id)
              return (
                <div
                  key={goal.id}
                  className={`bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-6 rounded-2xl border transition-all ${
                    goal.status === 'completed'
                      ? 'border-green-500/30'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{expert?.avatar}</span>
                        <h3 className="text-xl font-bold">{goal.title}</h3>
                        {goal.status === 'completed' && (
                          <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-gray-400 text-sm mb-3">{goal.description}</p>
                      )}
                      {goal.target_date && (
                        <p className="text-purple-400 text-sm">
                          Target: {new Date(goal.target_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {goal.status !== 'completed' && (
                        <button
                          onClick={() => handleCompleteGoal(goal.id)}
                          className="p-2 bg-green-500/20 border border-green-500/30 rounded-lg hover:bg-green-500/30"
                        >
                          <Check className="w-5 h-5 text-green-400" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {goal.status !== 'completed' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-purple-400 font-semibold">{goal.progress}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={goal.progress}
                        onChange={(e) => handleUpdateProgress(goal.id, parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}