import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import './styles/ChatLog.css'

const Message = ({ message, index }) => {
  const isUser = message.role === 'user'

  return (
    <motion.div
      className={`msg ${message.role}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div className="msg-meta">
        <span className="msg-sender">{isUser ? 'You' : 'Gideon'}</span>
        <span className="msg-time">{message.timestamp}</span>
      </div>
      <motion.div
        className="msg-bubble"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {message.text}
      </motion.div>
    </motion.div>
  )
}

const ChatLog = () => {
  const { messages, isTyping, isSpeaking } = useAppStore()
  const logRef = useRef(null)

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [messages, isTyping])

  return (
    <div className="chat-log" ref={logRef}>
      <div className="date-sep">Today · Session Start</div>

      <AnimatePresence mode="popLayout">
        {messages.map((message, index) => (
          <Message key={message.id} message={message} index={index} />
        ))}
      </AnimatePresence>

      {/* Activity indicators */}
      <div className="activity-strip">
        <motion.div
          className={`typing-bubble ${isTyping ? 'on' : ''}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: isTyping ? 1 : 0,
            scale: isTyping ? 1 : 0.8
          }}
          transition={{ duration: 0.2 }}
        >
          <span></span>
          <span></span>
          <span></span>
        </motion.div>

        <motion.div
          className={`waveform ${isSpeaking ? 'on' : ''}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: isSpeaking ? 1 : 0,
            scale: isSpeaking ? 1 : 0.8
          }}
          transition={{ duration: 0.2 }}
        >
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </motion.div>
      </div>
    </div>
  )
}

export default ChatLog
