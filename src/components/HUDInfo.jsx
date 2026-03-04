import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import './styles/HUDInfo.css'

const HUDInfo = () => {
  const [freq, setFreq] = useState(120)
  const [proc, setProc] = useState(97.5)
  const [uptime, setUptime] = useState('00:00')
  const startTime = React.useRef(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setFreq((Math.random() * 38 + 102).toFixed(1))
      setProc((97.2 + Math.random() * 2.4).toFixed(1))
      
      const s = Math.floor((Date.now() - startTime.current) / 1000)
      const mins = String(Math.floor(s / 60)).padStart(2, '0')
      const secs = String(s % 60).padStart(2, '0')
      setUptime(`${mins}:${secs}`)
    }, 1200)

    return () => clearInterval(interval)
  }, [])

  const items = [
    { label: 'NEURAL', value: 'SYNC ✓' },
    { label: 'FREQ', value: `${freq}Hz` },
    { label: 'UPTIME', value: uptime },
    { label: 'PROC', value: `${proc}%` }
  ]

  return (
    <motion.div 
      className="hud-row"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      {items.map((item, index) => (
        <motion.div 
          key={item.label}
          className="hud-item"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
        >
          <div className="hud-label">{item.label}</div>
          <div className="hud-value">{item.value}</div>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default HUDInfo
