import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import './styles/PermissionBanner.css'

const PermissionBanner = () => {
  const { showPermBanner, setShowPermBanner, setWakeState } = useAppStore()
  const [errorMessage, setErrorMessage] = React.useState(null)

  useEffect(() => {
    // Check if speech recognition is supported
    const isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    
    if (!isSupported) {
      setWakeState('unsupported')
      return
    }

    // Check if we already have mic permission
    navigator.permissions?.query({ name: 'microphone' })
      .then(permissionStatus => {
        if (permissionStatus.state === 'granted') {
          // Permission already granted. Mic still starts only when user clicks the mic button.
          setShowPermBanner(false)
          setWakeState('idle')
        } else {
          // Show banner after a delay
          setTimeout(() => {
            setShowPermBanner(true)
          }, 1200)
        }
      })
      .catch(() => {
        // Fallback if permissions API not available
        setTimeout(() => {
          setShowPermBanner(true)
        }, 1200)
      })

  }, [])

  const handleEnableMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      setShowPermBanner(false)
      setWakeState('idle')
      setErrorMessage(null)
    } catch (error) {
      console.error('Microphone permission denied:', error)
      setErrorMessage('⚠️  Mic access denied — please allow in browser settings.')
    }
  }

  return (
    <AnimatePresence>
      {showPermBanner && (
        <motion.div
          className="perm-banner"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        >
          <span>
            {errorMessage || (
              <>
                🎤 &nbsp; Click the <strong>microphone button</strong> to use voice input — microphone access required
              </>
            )}
          </span>
          {!errorMessage && (
            <motion.button
              className="perm-btn"
              onClick={handleEnableMic}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ENABLE MIC
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PermissionBanner
