import React from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import './styles/StatusPill.css'

const StatusPill = () => {
  const { status, isSpeaking } = useAppStore()

  return (
    <motion.div 
      className="status-pill"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <motion.div 
        className="status-dot"
        animate={{
          scale: isSpeaking ? [1, 1.2, 1] : [1, 0.72, 1],
          opacity: isSpeaking ? [1, 0.8, 1] : [1, 0.32, 1]
        }}
        transition={{
          duration: isSpeaking ? 0.8 : 2.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          background: isSpeaking ? 'var(--red)' : 'var(--cyan)',
          boxShadow: isSpeaking ? '0 0 8px var(--red)' : '0 0 8px var(--cyan)'
        }}
      />
      <div className="status-text">{status}</div>
    </motion.div>
  )
}

export default StatusPill
