'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, RotateCcw, Brain, User, Send } from 'lucide-react'

interface DemoPlayerProps {
  isOpen: boolean
  onClose: () => void
}

interface DemoMessage {
  role: 'user' | 'assistant'
  content: string
  expertId: string
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
    assistantMessage: "I hear you, and that constant 'on' feeling is exhausting. Let's try something: What's one small boundary you could set this week? Maybe no emails after 7pm, or a 10-minute walk at lunch. Small wins build momentum. What feels doable for you?"
  },
  {
    expert: experts[1],
    userMessage: "I'm thinking of launching a side project but I'm scared to fail. How do I validate my idea?",
    assistantMessage: "Fear of failure is natural—it means you care. Here's my framework: Before building anything, talk to 10 potential customers this week. Ask what problems they face, not if they'd buy your solution. Real insights come from listening, not pitching. Ready to identify your first 3 people to reach out to?"
  },
  {
    expert: experts[2],
    userMessage: "I want to get fit but I keep falling off after a few weeks. What am I doing wrong?",
    assistantMessage: "You're not doing anything wrong—you're just going too hard too fast! Let's flip the script: Instead of 'I'll work out 5x a week,' try '10 minutes of movement daily.' Consistency beats intensity. What's one activity you actually enjoy? Let's build your routine around that."
  }
]

export default function DemoPlayer({ isOpen, onClose }: DemoPlayerProps) {
  const [currentScenario, setCurrentScenario] = useState(0)
  const [messages, setMessages] = useState<DemoMessage[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [typingText, setTypingText] = useState('')
  const [phase, setPhase] = useState<'idle' | 'typing-user' | 'sending' | 'typing-assistant' | 'complete'>('idle')
  const [inputText, setInputText] = useState('')

  const scenario = demoScenarios[currentScenario]

  const resetDemo = useCallback(() => {
    setMessages([])
    setTypingText('')
    setInputText('')
    setPhase('idle')
    setIsPlaying(false)
  }, [])

  const typeText = useCallback((text: string, onComplete: () => void, speed = 30) => {
    let index = 0
    setTypingText('')

    const interval = setInterval(() => {
      if (index < text.length) {
        setTypingText(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        onComplete()
      }
    }, speed)

    return () => clearInterval(interval)
  }, [])

  const playDemo = useCallback(() => {
    if (phase !== 'idle' && phase !== 'complete') return

    setIsPlaying(true)
    setMessages([])
    setPhase('typing-user')

    // Type user message in input
    let index = 0
    const userText = scenario.userMessage

    const typeUserInterval = setInterval(() => {
      if (index < userText.length) {
        setInputText(userText.slice(0, index + 1))
        index++
      } else {
        clearInterval(typeUserInterval)

        // Pause then "send"
        setTimeout(() => {
          setPhase('sending')
          setInputText('')
          setMessages([{ role: 'user', content: userText, expertId: scenario.expert.id }])

          // Start typing assistant response
          setTimeout(() => {
            setPhase('typing-assistant')
            let assistantIndex = 0
            const assistantText = scenario.assistantMessage

            const typeAssistantInterval = setInterval(() => {
              if (assistantIndex < assistantText.length) {
                setTypingText(assistantText.slice(0, assistantIndex + 1))
                assistantIndex++
              } else {
                clearInterval(typeAssistantInterval)
                setMessages(prev => [...prev, { role: 'assistant', content: assistantText, expertId: scenario.expert.id }])
                setTypingText('')
                setPhase('complete')

                // Auto-advance to next scenario after delay
                setTimeout(() => {
                  if (currentScenario < demoScenarios.length - 1) {
                    setCurrentScenario(prev => prev + 1)
                    setMessages([])
                    setPhase('idle')
                  } else {
                    setIsPlaying(false)
                  }
                }, 3000)
              }
            }, 20)
          }, 800)
        }, 500)
      }
    }, 40)

    return () => clearInterval(typeUserInterval)
  }, [phase, scenario, currentScenario])

  // Auto-play when opened
  useEffect(() => {
    if (isOpen && phase === 'idle' && !isPlaying) {
      const timer = setTimeout(() => playDemo(), 800)
      return () => clearTimeout(timer)
    }
  }, [isOpen, phase, isPlaying, playDemo])

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      resetDemo()
      setCurrentScenario(0)
    }
  }, [isOpen, resetDemo])

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
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="relative w-full max-w-4xl bg-gradient-to-br from-slate-900 via-purple-950/50 to-slate-900 rounded-3xl border border-purple-500/30 shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-purple-500" />
              <span className="text-xl font-bold gradient-text">NEXUS Demo</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Scenario indicators */}
              <div className="flex gap-2 mr-4">
                {demoScenarios.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentScenario(i)
                      resetDemo()
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === currentScenario
                        ? 'bg-purple-500 scale-125'
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={resetDemo}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Restart"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={() => isPlaying ? setIsPlaying(false) : playDemo()}
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

          {/* Expert Selector */}
          <div className="px-6 py-4 border-b border-white/10 bg-black/20">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {experts.map((expert, i) => (
                <motion.div
                  key={expert.id}
                  animate={{
                    scale: expert.id === scenario.expert.id ? 1.05 : 1,
                    opacity: expert.id === scenario.expert.id ? 1 : 0.5
                  }}
                  className={`flex items-center gap-3 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap ${
                    expert.id === scenario.expert.id
                      ? 'border-purple-500 bg-purple-900/40'
                      : 'border-white/10 bg-black/30'
                  }`}
                >
                  <span className="text-2xl">{expert.avatar}</span>
                  <div className="text-left">
                    <div className="font-semibold text-sm">{expert.name}</div>
                    <div className="text-xs text-gray-400">{expert.specialty}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="h-[400px] overflow-y-auto p-6 space-y-4">
            {/* Welcome message if no messages */}
            {messages.length === 0 && phase === 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">{scenario.expert.avatar}</div>
                <h3 className="text-2xl font-bold mb-2">Hi, I'm {scenario.expert.name}</h3>
                <p className="text-gray-400">{scenario.expert.specialty} Expert</p>
                <p className="text-gray-500 mt-4 text-sm">Demo starting...</p>
              </motion.div>
            )}

            {/* Messages */}
            {messages.map((message, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-cyan-600'
                    : 'bg-gradient-to-br from-purple-600 to-pink-600'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <span className="text-lg">{scenario.expert.avatar}</span>
                  )}
                </div>
                <div className={`max-w-[75%] p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600/30 to-cyan-600/30 border border-blue-500/30'
                    : 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30'
                }`}>
                  <p className="text-gray-100 leading-relaxed">{message.content}</p>
                </div>
              </motion.div>
            ))}

            {/* Typing indicator for assistant */}
            {phase === 'typing-assistant' && typingText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
                  <span className="text-lg">{scenario.expert.avatar}</span>
                </div>
                <div className="max-w-[75%] p-4 rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30">
                  <p className="text-gray-100 leading-relaxed">{typingText}<span className="animate-pulse">|</span></p>
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
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
                  <span className="text-lg">{scenario.expert.avatar}</span>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30">
                  <div className="flex gap-1">
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
                  placeholder="Watch the demo..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
                />
                {phase === 'typing-user' && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 animate-pulse text-purple-400">|</span>
                )}
              </div>
              <motion.button
                animate={{
                  scale: phase === 'typing-user' && inputText.length > 0 ? [1, 1.1, 1] : 1,
                }}
                transition={{ repeat: phase === 'typing-user' ? Infinity : 0, duration: 1 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
            <p className="text-center text-gray-500 text-xs mt-3">
              This is an automated demo showing NEXUS in action
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
