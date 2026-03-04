import React from 'react'
import { motion } from 'framer-motion'
import './styles/QuickChips.css'

const QuickChips = () => {
  const chips = [
    'What can you help with?',
    'How do I get started?',
    'Tell me about yourself',
    'Help me write something'
  ]

  const handleChipClick = (text) => {
    const event = new CustomEvent('quickChipClick', { detail: text })
    window.dispatchEvent(event)
  }

  return (
    <div className="chips-container">
      <motion.div 
        className="chips-label"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        Try asking…
      </motion.div>
      <div className="chips">
        {chips.map((chip, index) => (
          <motion.button
            key={chip}
            className="chip"
            onClick={() => handleChipClick(chip)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
            whileHover={{ 
              scale: 1.05,
              opacity: 1,
              borderColor: 'var(--border-hi)',
              background: 'var(--cyan-mid)',
              boxShadow: '0 0 12px rgba(0,240,255,.2)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            {chip}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default QuickChips
