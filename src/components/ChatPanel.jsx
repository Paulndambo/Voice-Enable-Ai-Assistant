import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import ChatHeader from './ChatHeader'
import ChatLog from './ChatLog'
import ChatInput from './ChatInput'
import ProcessingOverlay from './ProcessingOverlay'
import { useAppStore } from '../store/appStore'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { queryGemini } from '../services/geminiService'
import './styles/ChatPanel.css'

const ChatPanel = () => {
  const {
    addMessage,
    addToHistory,
    conversationHistory,
    setIsProcessing,
    setIsTyping,
    setStatus,
    isMuted
  } = useAppStore()

  const { speak, unlockAudio } = useSpeechSynthesis()
  const [inputValue, setInputValue] = useState('')

  const handleCapture = (transcript) => {
    setInputValue(transcript)
    setTimeout(() => {
      handleSend(transcript)
    }, 100)
  }

  const { startListening } = useSpeechRecognition(handleCapture)

  const handleMicClick = () => {
    unlockAudio()
    startListening()
  }

  const handleSend = async (text = inputValue) => {
    const message = text.trim()
    if (!message) return

    unlockAudio()
    setInputValue('')
    addMessage('user', message)

    setIsProcessing(true)
    setIsTyping(true)
    setStatus('PROCESSING', false)

    const result = await queryGemini(message, conversationHistory)

    setIsProcessing(false)
    setIsTyping(false)

    addMessage('gideon', result.reply)
    addToHistory('user', message)
    addToHistory('model', result.reply)

    setStatus('ONLINE', false)

    if (!isMuted) {
      speak(result.reply)
    }
  }

  // Listen for quick chip clicks
  useEffect(() => {
    const handleQuickChip = (e) => {
      setInputValue(e.detail)
      setTimeout(() => handleSend(e.detail), 100)
    }

    window.addEventListener('quickChipClick', handleQuickChip)
    return () => window.removeEventListener('quickChipClick', handleQuickChip)
  }, [])

  // Speak welcome message
  useEffect(() => {
    const timer = setTimeout(() => {
      const facts = [
        "Did you know that honey never spoils? Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.",
        "Did you know that a day on Venus is longer than a year on Venus?",
        "Did you know that bananas are berries, but strawberries aren't?",
        "Did you know that octopuses have three hearts?",
        "Did you know that Wombat poop is cube-shaped?",
        "Did you know that the Eiffel Tower can be 15 cm taller during the summer due to thermal expansion?",
        "Did you know that humans share 50% of their DNA with bananas?",
        "Did you know that a jiffy is an actual unit of time? It's 1/100th of a second.",
        "Did you know that the shortest commercial flight in the world lasts just 57 seconds?",
        "Did you know that the unicorn is the national animal of Scotland?"
      ];

      const randomFact = facts[Math.floor(Math.random() * facts.length)];
      const greetings = [
        (fact) => `Paul! There you are. Was wondering when you'd show up 😄\n\nOh, and before I forget — ${fact}`,
        (fact) => `Hey hey, Paul's in the building! Ready when you are.\n\nAlso, completely unrelated but my brain won't let it go — ${fact}`,
        (fact) => `Back again! Good to see you, Paul. What's on your mind today?\n\nWhile you think about it — ${fact}`,
        (fact) => `Ah, Paul. Right on time — or fashionably late, I can't tell anymore 😂\n\nAnyway, here's something I stumbled on: ${fact}`,
        (fact) => `Hey! Okay so I've just been sitting here waiting, no big deal 😄 What are we getting into today?\n\nAlso — ${fact}`,
        (fact) => `Paul! Good timing. I was just about to start talking to myself.\n\nHere, take this fact as a peace offering: ${fact}`,
        (fact) => `There's my guy! Alright, I'm all yours — what do you need?\n\nOh, and heads up — ${fact}`,
        (fact) => `Hey Paul! Glad you're here. I've been low-key bored without you 😄\n\nSpeaking of random things — ${fact}`,
      ]

      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      const welcomeMsg = randomGreeting(randomFact);

      addMessage('gideon', welcomeMsg)

      if (!isMuted) {
        speak(welcomeMsg)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      className="chat-panel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <ChatHeader />
      <ChatLog />
      <ProcessingOverlay />
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={() => handleSend()}
        onMicClick={handleMicClick}
      />
    </motion.div>
  )
}

export default ChatPanel
