'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, Brain, User, Send, Volume2, VolumeX } from 'lucide-react'

interface DemoPlayerProps {
  isOpen: boolean
  onClose: () => void
}

interface DemoMessage {
  role: 'user' | 'assistant'
  content: string
}

const experts = [
  { id: 'therapist', name: 'Dr. Sarah Chen', specialty: 'Clinical Psychology', avatar: '🧠', color: 'from-purple-500 to-pink-500' },
  { id: 'business', name: 'Marcus Reid', specialty: 'Business Strategy', avatar: '💼', color: 'from-blue-500 to-cyan-500' },
  { id: 'wellness', name: 'Coach Jamie', specialty: 'Wellness & Fitness', avatar: '💪', color: 'from-green-500 to-emerald-500' },
]

const demoScenarios = [
  {
    expert: experts[0],
    userMessage: "I've been feeling overwhelmed with work lately and can't seem to switch off. Any advice?",
    assistantMessage: "I hear you, and that constant 'on' feeling is exhausting. Let's try something: What's one small boundary you could set this week? Maybe no emails after 7pm, or a 10-minute walk at lunch. Small wins build momentum."
  },
  {
    expert: experts[1],
    userMessage: "I'm thinking of launching a side project but I'm scared to fail. How do I validate my idea?",
    assistantMessage: "Fear of failure is natural—it means you care. Here's my framework: Before building anything, talk to 10 potential customers this week. Ask what problems they face, not if they'd buy your solution. Real insights come from listening."
  },
  {
    expert: experts[2],
    userMessage: "I want to get fit but I keep falling off after a few weeks. What am I doing wrong?",
    assistantMessage: "You're not doing anything wrong—you're just going too hard too fast! Instead of 'I'll work out 5x a week,' try '10 minutes of movement daily.' Consistency beats intensity. What's one activity you actually enjoy?"
  }
]

export default function DemoPlayer({ isOpen, onClose }: DemoPlayerProps) {
  const [currentScenario, setCurrentScenario] = useState(0)
  const [messages, setMessages] = useState<DemoMessage[]>([])
  const [isPlaying, setIsPlaying] = useState(true)
  const [typingText, setTypingText] = useState('')
  const [phase, setPhase] = useState<'intro' | 'typing-user' | 'sending' | 'typing-assistant' | 'complete'>('intro')
  const [inputText, setInputText] = useState('')
  const [progress, setProgress] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const scenario = demoScenarios[currentScenario]

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const nextScenario = useCallback(() => {
    setCurrentScenario(prev => (prev + 1) % demoScenarios.length)
    setMessages([])
    setTypingText('')
    setInputText('')
    setPhase('intro')
    setProgress(0)
  }, [])

  // Main demo loop
  useEffect(() => {
    if (!isOpen || !isPlaying) return

    clearTimers()

    if (phase === 'intro') {
      // Show intro for 1.5s then start typing
      timeoutRef.current = setTimeout(() => setPhase('typing-user'), 1500)
    }
    else if (phase === 'typing-user') {
      // Type user message
      let index = 0
      const text = scenario.userMessage
      intervalRef.current = setInterval(() => {
        if (index < text.length) {
          setInputText(text.slice(0, index + 1))
          setProgress((index / text.length) * 25)
          index++
        } else {
          clearInterval(intervalRef.current!)
          timeoutRef.current = setTimeout(() => setPhase('sending'), 400)
        }
      }, 35)
    }
    else if (phase === 'sending') {
      // Send message and show loading
      setInputText('')
      setMessages([{ role: 'user', content: scenario.userMessage }])
      setProgress(30)
      timeoutRef.current = setTimeout(() => setPhase('typing-assistant'), 800)
    }
    else if (phase === 'typing-assistant') {
      // Type assistant response
      let index = 0
      const text = scenario.assistantMessage
      intervalRef.current = setInterval(() => {
        if (index < text.length) {
          setTypingText(text.slice(0, index + 1))
          setProgress(30 + (index / text.length) * 60)
          index++
        } else {
          clearInterval(intervalRef.current!)
          setMessages(prev => [...prev, { role: 'assistant', content: text }])
          setTypingText('')
          setProgress(95)
          timeoutRef.current = setTimeout(() => setPhase('complete'), 300)
        }
      }, 18)
    }
    else if (phase === 'complete') {
      // Show complete message for 2.5s then loop
      setProgress(100)
      timeoutRef.current = setTimeout(nextScenario, 2500)
    }

    return clearTimers
  }, [isOpen, isPlaying, phase, scenario, clearTimers, nextScenario])

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      clearTimers()
      setCurrentScenario(0)
      setMessages([])
      setTypingText('')
      setInputText('')
      setPhase('intro')
      setProgress(0)
      setIsPlaying(true)
    }
  }, [isOpen, clearTimers])

  const togglePlay = () => {
    setIsPlaying(prev => !prev)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          className="relative w-full max-w-4xl bg-gradient-to-br from-slate-900 via-purple-950/50 to-slate-900 rounded-3xl border border-purple-500/30 shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Progress Bar */}
          <div className="h-1 bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-purple-500" />
              <span className="text-xl font-bold gradient-text">NEXUS Demo</span>
              <span className="text-xs text-gray-500 bg-white/10 px-2 py-1 rounded-full">
                {currentScenario + 1}/{demoScenarios.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Scenario dots */}
              <div className="flex gap-2 mr-2">
                {demoScenarios.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      clearTimers()
                      setCurrentScenario(i)
                      setMessages([])
                      setTypingText('')
                      setInputText('')
                      setPhase('intro')
                      setProgress(0)
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentScenario
                        ? 'bg-purple-500 w-6'
                        : i < currentScenario
                        ? 'bg-purple-500/50'
                        : 'bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={togglePlay}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Current Expert Banner */}
          <div className="px-6 py-3 border-b border-white/10 bg-black/20">
            <motion.div
              key={scenario.expert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${scenario.expert.color} flex items-center justify-center text-2xl shadow-lg`}>
                {scenario.expert.avatar}
              </div>
              <div>
                <div className="font-bold">{scenario.expert.name}</div>
                <div className="text-sm text-gray-400">{scenario.expert.specialty}</div>
              </div>
            </motion.div>
          </div>

          {/* Chat Area */}
          <div className="h-[350px] overflow-y-auto p-6 space-y-4">
            {/* Intro screen */}
            {phase === 'intro' && messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`inline-block text-6xl mb-4 p-4 rounded-2xl bg-gradient-to-br ${scenario.expert.color} shadow-lg`}
                >
                  {scenario.expert.avatar}
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">Meet {scenario.expert.name}</h3>
                <p className="text-gray-400 mb-4">{scenario.expert.specialty} Expert</p>
                <div className="flex items-center justify-center gap-2 text-purple-400">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  <span className="text-sm">Starting conversation...</span>
                </div>
              </motion.div>
            )}

            {/* Messages */}
            <AnimatePresence mode="popLayout">
              {messages.map((message, i) => (
                <motion.div
                  key={`${currentScenario}-${i}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 20 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-cyan-600'
                      : `bg-gradient-to-br ${scenario.expert.color}`
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <span className="text-lg">{scenario.expert.avatar}</span>
                    )}
                  </div>
                  <div className={`max-w-[75%] p-4 rounded-2xl shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600/30 to-cyan-600/30 border border-blue-500/30'
                      : 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30'
                  }`}>
                    <p className="text-gray-100 leading-relaxed text-sm">{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator for assistant */}
            {phase === 'typing-assistant' && typingText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br ${scenario.expert.color}`}>
                  <span className="text-lg">{scenario.expert.avatar}</span>
                </div>
                <div className="max-w-[75%] p-4 rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 shadow-lg">
                  <p className="text-gray-100 leading-relaxed text-sm">{typingText}<span className="animate-pulse text-purple-400">|</span></p>
                </div>
              </motion.div>
            )}

            {/* Loading dots when sending */}
            {phase === 'sending' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br ${scenario.expert.color}`}>
                  <span className="text-lg">{scenario.expert.avatar}</span>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 shadow-lg">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="px-6 py-4 border-t border-white/10 bg-black/40">
            <div className="flex gap-3 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  readOnly
                  placeholder={phase === 'intro' ? `Ask ${scenario.expert.name} anything...` : 'Watching demo...'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none cursor-default"
                />
                {phase === 'typing-user' && inputText && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 animate-pulse text-purple-400">|</span>
                )}
              </div>
              <motion.button
                animate={{
                  scale: phase === 'sending' ? [1, 1.2, 1] : 1,
                  backgroundColor: phase === 'sending' ? '#22c55e' : undefined
                }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl shadow-lg"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="flex items-center justify-center gap-4 mt-3">
              <p className="text-gray-500 text-xs">
                Auto-playing demo • Click anywhere outside to close
              </p>
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <Play className="w-3 h-3" /> Resume
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
