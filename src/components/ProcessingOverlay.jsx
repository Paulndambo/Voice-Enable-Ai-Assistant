import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import './styles/ProcessingOverlay.css'

const ProcessingOverlay = () => {
  const { isProcessing } = useAppStore()
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const stateRef = useRef({
    t: 0,
    files: [],
    nodes: [],
    scanY: 0,
    activeLines: [],
    lineTimer: 0,
    msgIdx: 0,
    msgTimer: 0
  })

  const statusMessages = [
    'SCANNING KNOWLEDGE BASE',
    'INDEXING NEURAL MEMORY',
    'QUERYING DATA NODES',
    'PARSING CONTEXT GRAPH',
    'TRAVERSING LINK TREE',
    'COMPILING RESPONSE',
    'ACCESSING ARCHIVES',
    'CROSS-REFERENCING DATA',
    'SYNTHESIZING ANSWER'
  ]

  const [currentMessage, setCurrentMessage] = React.useState(statusMessages[0])

  useEffect(() => {
    if (!isProcessing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resizeCanvas()

    const state = stateRef.current
    const W = canvas.width
    const H = canvas.height

    // Initialize files
    state.files = Array.from({ length: 12 }, (_, i) => ({
      x: 0,
      y: 0,
      w: 52 + Math.random() * 24,
      h: 0,
      vx: 0,
      vy: 0,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.06,
      alpha: 0,
      phase: Math.random() * Math.PI * 2,
      label: ['SYS.DAT', 'KB_INDEX', 'MEM.BIN', 'NODES.db', 'ARCH.LOG', 'LINK.map',
        'CTX.vec', 'REF.idx', 'PARSE.tmp', 'QUERY.q', 'RESP.gen', 'SYNTH.out'][i],
      color: Math.random() > 0.5 ? '#00f0ff' : '#0088ff',
      active: true,
      flipDir: Math.random() > 0.5 ? 1 : -1,
      delay: i * 120
    }))

    state.files.forEach(f => {
      f.h = f.w * 1.3
      const edge = Math.floor(Math.random() * 4)
      if (edge === 0) {
        f.x = -f.w
        f.y = Math.random() * H
      } else if (edge === 1) {
        f.x = W + f.w
        f.y = Math.random() * H
      } else if (edge === 2) {
        f.x = Math.random() * W
        f.y = -f.h
      } else {
        f.x = Math.random() * W
        f.y = H + f.h
      }
      const tx = W * (0.2 + Math.random() * 0.6)
      const ty = H * (0.2 + Math.random() * 0.6)
      const spd = 0.4 + Math.random() * 0.6
      const dist = Math.hypot(tx - f.x, ty - f.y)
      f.vx = (tx - f.x) / dist * spd
      f.vy = (ty - f.y) / dist * spd
    })

    // Initialize nodes
    state.nodes = Array.from({ length: 18 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 3 + 2,
      pulse: Math.random() * Math.PI * 2,
      lit: false,
      litT: 0
    }))

    const drawHexGrid = (w, h) => {
      const size = 22
      const rows = Math.ceil(h / size / 1.5) + 1
      const cols = Math.ceil(w / size * 1.2) + 1
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const xOff = c * size * 1.732 + (r % 2) * size * 0.866
          const yOff = r * size * 1.5
          const pulse = Math.sin(state.t * 0.8 + c * 0.4 + r * 0.5)
          const alpha = 0.018 + pulse * 0.012
          if (alpha < 0.005) continue
          ctx.beginPath()
          for (let s = 0; s < 6; s++) {
            const a = s * Math.PI / 3
            const px = xOff + size * 0.5 * Math.cos(a)
            const py = yOff + size * 0.5 * Math.sin(a)
            s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
          }
          ctx.closePath()
          ctx.strokeStyle = `rgba(0,240,255,${alpha})`
          ctx.lineWidth = 0.6
          ctx.stroke()
        }
      }
    }

    const drawNodes = (w, h) => {
      // Draw connections
      state.nodes.forEach((n, i) => {
        state.nodes.forEach((m, j) => {
          if (j <= i) return
          const d = Math.hypot((n.x - m.x) * w, (n.y - m.y) * h)
          if (d > w * 0.28) return
          const alpha = (1 - d / (w * 0.28)) * 0.25 * (n.lit || m.lit ? 2.5 : 1)
          ctx.beginPath()
          ctx.moveTo(n.x * w, n.y * h)
          ctx.lineTo(m.x * w, m.y * h)
          ctx.strokeStyle = `rgba(0,240,255,${alpha})`
          ctx.lineWidth = 0.6
          ctx.stroke()
        })
      })

      // Light up random nodes
      if (Math.random() < 0.04) {
        const n = state.nodes[Math.floor(Math.random() * state.nodes.length)]
        n.lit = true
        n.litT = 0
      }

      state.nodes.forEach(n => {
        n.pulse += 0.05
        if (n.lit) n.litT += 0.06
        const glow = n.lit ? Math.max(0, 1 - n.litT) : 0
        if (n.litT > 1) n.lit = false
        const r = n.r + Math.sin(n.pulse) * 0.8 + glow * 4
        const alpha = 0.25 + glow * 0.6
        ctx.beginPath()
        ctx.arc(n.x * w, n.y * h, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,240,255,${alpha})`
        ctx.fill()
        if (glow > 0.1) {
          ctx.beginPath()
          ctx.arc(n.x * w, n.y * h, r + 4, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(0,240,255,${glow * 0.4})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      })
    }

    const drawFile = (f, now) => {
      if (!f.active || now < f.delay) return
      f.alpha = Math.min(1, f.alpha + 0.04)
      f.x += f.vx
      f.y += f.vy
      f.rot += f.rotV

      const flip = Math.sin((state.t + f.phase) * 2.2) * f.flipDir
      const scaleX = Math.abs(flip)

      ctx.save()
      ctx.translate(f.x, f.y)
      ctx.rotate(f.rot)
      ctx.scale(scaleX, 1)
      ctx.globalAlpha = f.alpha * 0.78

      // File body
      ctx.beginPath()
      const corner = f.w * 0.22
      ctx.moveTo(-f.w / 2 + corner, -f.h / 2)
      ctx.lineTo(f.w / 2, -f.h / 2)
      ctx.lineTo(f.w / 2, f.h / 2)
      ctx.lineTo(-f.w / 2, f.h / 2)
      ctx.lineTo(-f.w / 2, -f.h / 2 + corner)
      ctx.closePath()
      ctx.fillStyle = 'rgba(0,20,38,0.82)'
      ctx.fill()
      ctx.strokeStyle = f.color
      ctx.lineWidth = 1
      ctx.stroke()

      // Label
      if (scaleX > 0.3) {
        ctx.globalAlpha = f.alpha * scaleX * 0.9
        ctx.font = `7px "Share Tech Mono"`
        ctx.fillStyle = f.color
        ctx.textAlign = 'center'
        ctx.fillText(f.label, 0, f.h / 2 - 8)
      }

      ctx.restore()
      ctx.globalAlpha = 1
    }

    const drawScanline = (w, h) => {
      state.scanY += 2.2
      if (state.scanY > h) state.scanY = 0
      const grad = ctx.createLinearGradient(0, state.scanY - 18, 0, state.scanY + 18)
      grad.addColorStop(0, 'transparent')
      grad.addColorStop(0.5, `rgba(0,240,255,0.12)`)
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.fillRect(0, state.scanY - 18, w, 36)
    }

    const drawProgressBar = (w, h) => {
      const bw = w * 0.55
      const bh = 6
      const bx = (w - bw) / 2
      const by = h - 38

      // Track
      ctx.beginPath()
      ctx.roundRect(bx, by, bw, bh, 3)
      ctx.fillStyle = 'rgba(0,240,255,0.1)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,240,255,0.25)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Fill
      const fill = 0.15 + 0.55 * (0.5 + 0.5 * Math.sin(state.t * 1.4)) + 0.3 * (0.5 + 0.5 * Math.sin(state.t * 0.7))
      const fw = Math.min(bw - 4, bw * fill)
      ctx.beginPath()
      ctx.roundRect(bx + 2, by + 2, fw, bh - 4, 2)
      const pg = ctx.createLinearGradient(bx, 0, bx + bw, 0)
      pg.addColorStop(0, 'rgba(0,180,255,0.8)')
      pg.addColorStop(1, 'rgba(0,240,255,1)')
      ctx.fillStyle = pg
      ctx.fill()

      // Percentage
      ctx.font = '8px "Share Tech Mono"'
      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(0,240,255,0.6)'
      ctx.fillText(`${Math.floor(fill * 100)}%`, w / 2, by + bh + 12)
    }

    const animate = () => {
      if (!isProcessing) return

      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      drawHexGrid(w, h)
      drawNodes(w, h)
      drawScanline(w, h)
      state.files.forEach(f => drawFile(f, state.t * 1000))
      drawProgressBar(w, h)

      state.t += 0.016

      // Update status message
      state.msgTimer++
      if (state.msgTimer > 90) {
        state.msgTimer = 0
        state.msgIdx = (state.msgIdx + 1) % statusMessages.length
        setCurrentMessage(statusMessages[state.msgIdx])
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isProcessing])

  return (
    <AnimatePresence>
      {isProcessing && (
        <motion.div
          className="proc-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <canvas ref={canvasRef} className="proc-canvas" />
          <motion.div
            className="proc-label"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <motion.span
              className="proc-icon"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            >
              ⟳
            </motion.span>
            <span className="proc-text">{currentMessage}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ProcessingOverlay
