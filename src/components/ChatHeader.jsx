import React from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import './styles/ChatHeader.css'

const ChatHeader = () => {
  const {
    isMuted,
    isSpeaking,
    wakeState,
    toggleMute,
    clearMessages
  } = useAppStore()

  const { cancel } = useSpeechSynthesis()

  const handleMuteToggle = () => {
    toggleMute()
    if (!isMuted) {
      cancel()
    }
  }

  const handleClear = () => {
    if (window.confirm('Clear conversation history?')) {
      clearMessages()
      cancel()
    }
  }

  return (
    <div className="chat-header">
      <div className="hdr-avatar">🤖</div>
      <div className="hdr-info">
        <div className="hdr-name">Gideon</div>
        <div className="hdr-sub">
          AI Assistant · Online
          {(wakeState === 'awake' || wakeState === 'capturing') && (
            <span className="live-bars">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </span>
          )}
        </div>
      </div>
      <div className="hdr-btns">
        <motion.button
          className={`icon-btn ${isMuted ? 'muted' : ''}`}
          onClick={handleMuteToggle}
          title={isMuted ? 'Unmute voice' : 'Mute voice'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMuted ? '🔇' : '🔊'}
        </motion.button>
        <motion.button
          className="icon-btn"
          onClick={handleClear}
          title="Clear conversation"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🗑
        </motion.button>
      </div>
    </div>
  )
}

export default ChatHeader
