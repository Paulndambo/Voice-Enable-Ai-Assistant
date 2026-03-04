import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import AvatarPanel from './components/AvatarPanel'
import ChatPanel from './components/ChatPanel'
import PermissionBanner from './components/PermissionBanner'
import { useAppStore } from './store/appStore'
import './styles/App.css'

function App() {
  const { initializeApp } = useAppStore()

  useEffect(() => {
    initializeApp()
  }, [initializeApp])

  return (
    <div className="app">
      <PermissionBanner />
      
      <motion.div 
        className="app-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <AvatarPanel />
        <ChatPanel />
      </motion.div>
    </div>
  )
}

export default App
