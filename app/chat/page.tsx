'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Brain, Loader2, User, Sparkles, Home, Trash2, LogOut, Save, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Expert {
  id: string
  name: string
  specialty: string
  avatar: string
  description: string
}

const experts: Expert[] = [
  {
    id: 'therapist',
    name: 'Dr. Sarah Chen',
    specialty: 'Clinical Psychology',
    avatar: '🧠',
    description: 'Specializes in burnout, anxiety, and work-life balance using CBT/DBT approaches.'
  },
  {
    id: 'business',
    name: 'Marcus Reid',
    specialty: 'Business Strategy',
    avatar: '💼',
    description: 'Former VC partner with 15 years helping startups scale from seed to Series B.'
  },
  {
    id: 'wellness',
    name: 'Coach Jamie',
    specialty: 'Wellness & Fitness',
    avatar: '💪',
    description: 'Holistic health expert combining exercise science, nutrition, and mindfulness.'
  },
  {
    id: 'creative',
    name: 'Alex Rivera',
    specialty: 'Creative Direction',
    avatar: '🎨',
    description: 'Award-winning creative director helping artists find their unique voice.'
  }
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedExpert, setSelectedExpert] = useState<Expert>(experts[0])
  const [showExpertSelector, setShowExpertSelector] = useState(true)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
        loadConversation(user.id, selectedExpert.id)
      }
    }
    checkUser()
  }, [selectedExpert.id])

  const loadConversation = async (userId: string, expertId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .eq('expert_id', expertId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (data && !error) {
        setMessages(data.messages || [])
        setConversationId(data.id)
        setShowExpertSelector(false)
      }
    } catch (err) {
      console.log('No existing conversation found')
    }
  }

  const saveConversation = async (newMessages: Message[]) => {
    if (!user) return
    setIsSaving(true)

    try {
      if (conversationId) {
        await supabase
          .from('conversations')
          .update({
            messages: newMessages,
            updated_at: new Date().toISOString(),
          })
          .eq('id', conversationId)
      } else {
        const { data, error } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            expert_id: selectedExpert.id,
            title: newMessages[0]?.content.substring(0, 50) || 'New Conversation',
            messages: newMessages,
          })
          .select()
          .single()

        if (data) {
          setConversationId(data.id)
        }
      }

      await supabase.from('usage_analytics').insert({
        user_id: user.id,
        event_type: 'message_sent',
        event_data: { expert_id: selectedExpert.id },
      })
    } catch (err) {
      console.error('Error saving conversation:', err)
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear this conversation?')) {
      setMessages([])
      if (conversationId) {
        await supabase.from('conversations').delete().eq('id', conversationId)
        setConversationId(null)
      }
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }]
    setMessages(newMessages)
    setIsLoading(true)
    setShowExpertSelector(false)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          expert: selectedExpert
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      const updatedMessages = [...newMessages, { role: 'assistant' as const, content: data.message }]
      setMessages(updatedMessages)
      
      await saveConversation(updatedMessages)
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">Loading your advisors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Brain className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold gradient-text hidden sm:inline">NEXUS</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-3 bg-purple-900/30 px-4 py-2.5 rounded-full border border-purple-500/30 backdrop-blur-sm">
                <span className="text-2xl">{selectedExpert.avatar}</span>
                <div className="text-left">
                  <div className="font-semibold text-sm">{selectedExpert.name}</div>
                  <div className="text-xs text-gray-400">{selectedExpert.specialty}</div>
                </div>
              </div>
              <button
                onClick={() => setShowExpertSelector(!showExpertSelector)}
                className="px-4 py-2.5 bg-purple-600 rounded-full text-sm font-semibold hover:bg-purple-700 transition-all hover:scale-105"
              >
                Change Expert
              </button>
              {messages.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="px-4 py-2.5 bg-red-600/20 border border-red-500/30 rounded-full text-sm font-semibold hover:bg-red-600/30 transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 space-y-2"
              >
                <button
                  onClick={() => {
                    setShowExpertSelector(!showExpertSelector)
                    setShowMobileMenu(false)
                  }}
                  className="w-full px-4 py-2.5 bg-purple-600 rounded-lg text-sm font-semibold hover:bg-purple-700"
                >
                  Change Expert
                </button>
                {messages.length > 0 && (
                  <button
                    onClick={() => {
                      handleClearHistory()
                      setShowMobileMenu(false)
                    }}
                    className="w-full px-4 py-2.5 bg-red-600/20 border border-red-500/30 rounded-lg text-sm font-semibold"
                  >
                    Clear Chat
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm font-semibold"
                >
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Expert Selector */}
      <AnimatePresence>
        {showExpertSelector && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-blue-900/20 border-b border-purple-500/30 backdrop-blur-sm"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-400" />
                Choose Your Advisor
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {experts.map(expert => (
                  <motion.button
                    key={expert.id}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedExpert(expert)
                      setShowExpertSelector(false)
                      loadConversation(user.id, expert.id)
                    }}
                    className={`relative text-left p-6 rounded-2xl border-2 transition-all ${
                      selectedExpert.id === expert.id
                        ? 'border-purple-500 bg-purple-900/40 shadow-lg shadow-purple-500/20'
                        : 'border-white/10 bg-black/30 hover:border-purple-500/50 hover:bg-black/50'
                    }`}
                  >
                    <div className="text-5xl mb-3">{expert.avatar}</div>
                    <div className="font-bold text-lg mb-1">{expert.name}</div>
                    <div className="text-xs text-purple-400 mb-3 font-medium">{expert.specialty}</div>
                    <div className="text-xs text-gray-400 leading-relaxed">{expert.description}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && !showExpertSelector && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="inline-block p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl border border-purple-500/30 mb-6">
                <div className="text-7xl mb-4">{selectedExpert.avatar}</div>
              </div>
              <h2 className="text-4xl font-bold mb-4">
                Hi, I'm <span className="gradient-text">{selectedExpert.name}</span>
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                {selectedExpert.description}
              </p>
              <div className="inline-block px-6 py-3 bg-purple-600/20 border border-purple-500/30 rounded-full">
                <span className="text-purple-300">💬 How can I help you today?</span>
              </div>
            </motion.div>
          )}

          {messages.map((message, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex gap-4 mb-6 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                message.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-600 to-cyan-600' 
                  : 'bg-gradient-to-br from-purple-600 to-pink-600'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-6 h-6" />
                ) : (
                  <span className="text-2xl">{selectedExpert.avatar}</span>
                )}
              </div>
              <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`inline-block p-5 rounded-2xl message-bubble shadow-lg ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600/40 to-cyan-600/40 border border-blue-500/30 backdrop-blur-sm'
                    : 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 backdrop-blur-sm'
                }`}>
                  <div className="text-xs text-gray-300 mb-2 font-semibold opacity-80">
                    {message.role === 'user' ? 'You' : selectedExpert.name}
                  </div>
                  <div className="text-gray-50 whitespace-pre-wrap leading-relaxed">{message.content}</div>
                </div>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 mb-6"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl">{selectedExpert.avatar}</span>
              </div>
              <div className="flex-1">
                <div className="inline-block p-5 rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 backdrop-blur-sm shadow-lg">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                    <span className="text-gray-300">{selectedExpert.name} is thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-black/60 backdrop-blur-xl border-t border-white/10 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask ${selectedExpert.name} anything...`}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white/10 resize-none transition-all shadow-lg"
                rows={1}
                style={{ minHeight: '60px', maxHeight: '200px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-2xl hover:shadow-lg hover:shadow-purple-500/50 hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-3 text-center flex items-center justify-center gap-2">
            {isSaving && (
              <div className="flex items-center gap-2 text-purple-400">
                <Save className="w-3 h-3 animate-pulse" />
                Saving...
              </div>
            )}
            <span>NEXUS AI • Conversations saved securely • End-to-end encrypted</span>
          </div>
        </div>
      </div>
    </div>
  )
}