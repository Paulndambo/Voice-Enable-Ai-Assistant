import React from 'react'
import { motion } from 'framer-motion'
import HolographicAvatar from './HolographicAvatar'
import StatusPill from './StatusPill'
import HUDInfo from './HUDInfo'
import QuickChips from './QuickChips'
import './styles/AvatarPanel.css'

const AvatarPanel = () => {
  return (
    <motion.div
      className="avatar-panel"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="sys-label">Gideon — v4.7.1 — AI ASSISTANT INTERFACE</div>

      <HolographicAvatar />

      <StatusPill />

      <HUDInfo />

      <QuickChips />
    </motion.div>
  )
}

export default AvatarPanel
