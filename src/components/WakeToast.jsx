import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import './styles/WakeToast.css'

const WakeToast = () => {
  const { showWakeToast } = useAppStore()

  return (
    <AnimatePresence>
      {showWakeToast && (
        <motion.div
          className="wake-toast"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
        >
          <motion.div
            className="wake-dot"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <span>GIDEON ACTIVATED — LISTENING</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default WakeToast
