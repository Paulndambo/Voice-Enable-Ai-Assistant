import React, { useEffect, useRef } from 'react'
import { useAppStore } from '../store/appStore'
import './styles/HolographicAvatar.css'

const HolographicAvatar = () => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const stateRef = useRef({
    t: 0,
    blinkState: 1,
    blinkTimer: 0,
    nextBlink: 3 + Math.random() * 4,
    doubleBlink: false,
    headX: 0,
    headY: 0,
    headTilt: 0,
    headXTarget: 0,
    headYTarget: 0,
    headTiltTarget: 0,
    lookX: 0,
    lookY: 0,
    breathPhase: 0,
    emotionT: 0,
    sssFlicker: 0,
    mouthOpen: 0,
    speakIntensity: 0,
    // 3D rotation state
    rotY: 0,
    rotYTarget: 0,
    rotX: 0,
    rotXTarget: 0,
    scanOffset: 0
  })

  const { isSpeaking } = useAppStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const W = 320
    const H = 374
    canvas.width = W
    canvas.height = H

    const state = stateRef.current

    // Helper functions
    const lerp = (a, b, k) => a + (b - a) * k
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
    const skinColor = (alpha, bright = 1) => {
      const r = Math.round(lerp(60, 140, bright))
      const g = Math.round(lerp(160, 220, bright))
      const b = Math.round(lerp(190, 255, bright))
      return `rgba(${r},${g},${b},${alpha})`
    }

    // Ambient particles
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      z: Math.random(),  // depth for parallax
      r: Math.random() * 1.4 + 0.2,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      a: Math.random() * 0.5 + 0.1
    }))

    const cx = W / 2
    const cy = H / 2 - 10
    const fW = 108
    const fH = 138

    // Draw functions
    const drawBG = () => {
      ctx.clearRect(0, 0, W, H)
      const bg = ctx.createRadialGradient(cx, cy, 20, cx, cy, 210)
      bg.addColorStop(0, 'rgba(0,22,42,.95)')
      bg.addColorStop(0.5, 'rgba(0,12,28,.97)')
      bg.addColorStop(1, 'rgba(2,6,14,1)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Sweeping holographic band
      const sy = ((Math.sin(state.t * 0.38) + 1) / 2) * H
      const sw = ctx.createLinearGradient(0, sy - 28, 0, sy + 28)
      sw.addColorStop(0, 'transparent')
      sw.addColorStop(0.5, `rgba(0,240,255,${0.025 + state.sssFlicker * 0.01})`)
      sw.addColorStop(1, 'transparent')
      ctx.fillStyle = sw
      ctx.fillRect(0, sy - 28, W, 56)

      // Subtle grid lines for depth
      ctx.globalAlpha = 0.03
      ctx.strokeStyle = '#00e0ff'
      ctx.lineWidth = 0.5
      for (let i = 0; i < H; i += 20) {
        const warp = Math.sin((i + state.t * 15) * 0.02) * 3
        ctx.beginPath()
        ctx.moveTo(0, i + warp)
        ctx.lineTo(W, i + warp)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    const drawParticles = () => {
      particles.forEach(p => {
        // Parallax: deeper particles move slower
        const speed = 0.5 + p.z * 0.5
        p.x += p.vx * speed
        p.y += p.vy * speed
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0
        const d = Math.hypot(p.x - cx, p.y - cy)
        const alpha = d < fW * 0.9 ? 0.03 : p.a * (0.12 + p.z * 0.12)
        const size = p.r * (0.6 + p.z * 0.6)
        ctx.beginPath()
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,220,255,${alpha})`
        ctx.fill()
      })
    }

    const drawScanLines = (ox, oy, breath) => {
      // Holographic scan lines over the face area
      state.scanOffset = (state.scanOffset + 0.6) % 8
      ctx.save()
      ctx.translate(cx + ox, cy + oy + breath)
      ctx.rotate(state.headTilt)

      // Clip to face ellipse
      ctx.beginPath()
      ctx.ellipse(0, 0, fW * 0.95, fH * 1.22, 0, 0, Math.PI * 2)
      ctx.clip()

      // Draw scan lines
      ctx.globalAlpha = 0.06
      for (let y = -fH * 1.3; y < fH * 1.3; y += 3) {
        const lineY = y + state.scanOffset
        ctx.beginPath()
        ctx.moveTo(-fW * 1.1, lineY)
        ctx.lineTo(fW * 1.1, lineY)
        ctx.strokeStyle = '#00f0ff'
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Bright scan bar that moves down
      const scanBarY = ((state.t * 30) % (fH * 2.8)) - fH * 1.4
      const scanGrad = ctx.createLinearGradient(0, scanBarY - 12, 0, scanBarY + 12)
      scanGrad.addColorStop(0, 'transparent')
      scanGrad.addColorStop(0.5, 'rgba(0,240,255,0.12)')
      scanGrad.addColorStop(1, 'transparent')
      ctx.globalAlpha = 1
      ctx.fillStyle = scanGrad
      ctx.fillRect(-fW * 1.1, scanBarY - 12, fW * 2.2, 24)

      ctx.restore()
    }

    const drawFace = (ox, oy, breath) => {
      // 3D rotation offset for shading
      const rotShiftX = state.rotY * 30
      const rotShiftY = state.rotX * 20

      ctx.save()
      ctx.translate(cx + ox, cy + oy + breath)
      ctx.rotate(state.headTilt)
      ctx.scale(1, 1.26)

      // Deep aura (back glow for depth)
      const deepAura = ctx.createRadialGradient(0, -8, fW * 0.2, 0, -8, fW * 2)
      deepAura.addColorStop(0, 'rgba(0,120,200,.08)')
      deepAura.addColorStop(0.3, 'rgba(0,80,160,.05)')
      deepAura.addColorStop(0.6, 'rgba(0,40,100,.03)')
      deepAura.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.ellipse(0, 0, fW * 1.8, fH * 1.2, 0, 0, Math.PI * 2)
      ctx.fillStyle = deepAura
      ctx.fill()

      // Mid aura
      const aura = ctx.createRadialGradient(0, -8, fW * 0.3, 0, -8, fW * 1.6)
      aura.addColorStop(0, 'rgba(0,200,255,.09)')
      aura.addColorStop(0.5, 'rgba(0,100,180,.05)')
      aura.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.ellipse(0, 0, fW * 1.55, fH * 1.08, 0, 0, Math.PI * 2)
      ctx.fillStyle = aura
      ctx.fill()

      // Base skin with 3D lighting - light from upper-left
      const base = ctx.createRadialGradient(
        -fW * 0.25 + rotShiftX * 0.3, -fH * 0.28 + rotShiftY * 0.2, fW * 0.08,
        rotShiftX * 0.1, rotShiftY * 0.1, fW * 1.05
      )
      base.addColorStop(0, skinColor(0.92, 0.88))
      base.addColorStop(0.2, skinColor(0.85, 0.72))
      base.addColorStop(0.4, skinColor(0.78, 0.58))
      base.addColorStop(0.6, skinColor(0.68, 0.42))
      base.addColorStop(0.82, skinColor(0.52, 0.28))
      base.addColorStop(1, skinColor(0.18, 0.08))
      ctx.beginPath()
      ctx.ellipse(0, 0, fW, fH, 0, 0, Math.PI * 2)
      ctx.fillStyle = base
      ctx.fill()

      // 3D highlight - upper left specular
      const highlight = ctx.createRadialGradient(
        -fW * 0.3 + rotShiftX * 0.5, -fH * 0.35 + rotShiftY * 0.3, 2,
        -fW * 0.2 + rotShiftX * 0.3, -fH * 0.25 + rotShiftY * 0.2, fW * 0.6
      )
      highlight.addColorStop(0, 'rgba(180,240,255,.22)')
      highlight.addColorStop(0.3, 'rgba(100,210,240,.1)')
      highlight.addColorStop(0.7, 'rgba(40,120,180,.03)')
      highlight.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.ellipse(0, 0, fW, fH, 0, 0, Math.PI * 2)
      ctx.fillStyle = highlight
      ctx.fill()

      // Forehead highlight band
      const foreheadG = ctx.createRadialGradient(
        rotShiftX * 0.2, -fH * 0.55, 5,
        rotShiftX * 0.1, -fH * 0.45, fW * 0.7
      )
      foreheadG.addColorStop(0, 'rgba(160,230,255,.15)')
      foreheadG.addColorStop(0.4, 'rgba(80,180,220,.06)')
      foreheadG.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.ellipse(0, -fH * 0.45, fW * 0.7, fH * 0.35, 0, 0, Math.PI * 2)
      ctx.fillStyle = foreheadG
      ctx.fill()

        // Cheekbone highlights (left and right)
        ;[-1, 1].forEach(side => {
          const cheekX = side * fW * 0.5 + rotShiftX * 0.15
          const cheekY = -fH * 0.05 + rotShiftY * 0.1
          const cheekBright = side === -1 ? 0.16 : 0.08  // left cheek brighter (light from left)
          const cheekG = ctx.createRadialGradient(cheekX, cheekY, 1, cheekX, cheekY, fW * 0.35)
          cheekG.addColorStop(0, `rgba(150,230,255,${cheekBright})`)
          cheekG.addColorStop(0.5, `rgba(80,180,230,${cheekBright * 0.4})`)
          cheekG.addColorStop(1, 'transparent')
          ctx.beginPath()
          ctx.ellipse(cheekX, cheekY, fW * 0.35, fH * 0.2, 0, 0, Math.PI * 2)
          ctx.fillStyle = cheekG
          ctx.fill()
        })

      // Chin shadow for depth
      const chinG = ctx.createRadialGradient(0, fH * 0.7, 5, 0, fH * 0.8, fW * 0.7)
      chinG.addColorStop(0, 'rgba(0,20,40,.2)')
      chinG.addColorStop(0.5, 'rgba(0,10,25,.1)')
      chinG.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.ellipse(0, fH * 0.75, fW * 0.7, fH * 0.3, 0, 0, Math.PI * 2)
      ctx.fillStyle = chinG
      ctx.fill()

      // Rim lighting (edge glow for 3D pop) - right side
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(0, 0, fW, fH, 0, 0, Math.PI * 2)
      ctx.clip()

      const rimG = ctx.createLinearGradient(
        fW * 0.6 - rotShiftX * 0.5, -fH * 0.5,
        fW * 1.1 - rotShiftX * 0.3, fH * 0.2
      )
      rimG.addColorStop(0, 'rgba(0,200,255,.18)')
      rimG.addColorStop(0.5, 'rgba(0,240,255,.25)')
      rimG.addColorStop(1, 'rgba(0,150,220,.08)')
      ctx.beginPath()
      ctx.ellipse(fW * 0.75 - rotShiftX * 0.3, 0, fW * 0.55, fH * 1.05, 0, 0, Math.PI * 2)
      ctx.fillStyle = rimG
      ctx.fill()

      // Secondary rim on the other side (dimmer)
      const rimG2 = ctx.createLinearGradient(
        -fW * 0.8 - rotShiftX * 0.3, -fH * 0.3,
        -fW * 1.2 - rotShiftX * 0.2, fH * 0.3
      )
      rimG2.addColorStop(0, 'rgba(0,120,180,.06)')
      rimG2.addColorStop(0.5, 'rgba(0,180,220,.1)')
      rimG2.addColorStop(1, 'rgba(0,80,140,.03)')
      ctx.beginPath()
      ctx.ellipse(-fW * 0.85 - rotShiftX * 0.2, 0, fW * 0.4, fH * 1.02, 0, 0, Math.PI * 2)
      ctx.fillStyle = rimG2
      ctx.fill()
      ctx.restore()

      // Glow outline (double stroke for depth)
      ctx.beginPath()
      ctx.ellipse(0, 0, fW + 2, fH + 2, 0, 0, Math.PI * 2)
      ctx.shadowColor = '#00c8ff'
      ctx.shadowBlur = 25
      ctx.strokeStyle = 'rgba(0,200,255,.15)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.shadowBlur = 0

      ctx.beginPath()
      ctx.ellipse(0, 0, fW, fH, 0, 0, Math.PI * 2)
      ctx.shadowColor = '#00f0ff'
      ctx.shadowBlur = 14
      ctx.strokeStyle = 'rgba(0,240,255,.55)'
      ctx.lineWidth = 1.2
      ctx.stroke()
      ctx.shadowBlur = 0

      ctx.restore()
    }

    const drawNose = (ox, oy, breath) => {
      ctx.save()
      ctx.translate(cx + ox, cy + oy + breath)
      ctx.rotate(state.headTilt)

      const rotShiftX = state.rotY * 30
      const noseX = rotShiftX * 0.08

      // Nose bridge highlight
      const noseG = ctx.createLinearGradient(noseX - 4, -20, noseX + 6, 15)
      noseG.addColorStop(0, 'rgba(140,220,250,.08)')
      noseG.addColorStop(0.4, 'rgba(120,210,240,.14)')
      noseG.addColorStop(0.7, 'rgba(80,180,220,.08)')
      noseG.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.moveTo(noseX - 3, -18)
      ctx.bezierCurveTo(noseX - 5, -5, noseX - 8, 10, noseX - 6, 18)
      ctx.bezierCurveTo(noseX - 2, 22, noseX + 4, 22, noseX + 6, 18)
      ctx.bezierCurveTo(noseX + 8, 10, noseX + 3, -5, noseX + 3, -18)
      ctx.closePath()
      ctx.fillStyle = noseG
      ctx.fill()

      // Nose tip specular
      const tipG = ctx.createRadialGradient(noseX + 1, 16, 0.5, noseX, 15, 7)
      tipG.addColorStop(0, 'rgba(180,240,255,.18)')
      tipG.addColorStop(0.5, 'rgba(100,200,240,.06)')
      tipG.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.ellipse(noseX, 15, 7, 5, 0, 0, Math.PI * 2)
      ctx.fillStyle = tipG
      ctx.fill()

        // Nostril shadows
        ;[-1, 1].forEach(side => {
          const nx = noseX + side * 6
          const ny = 20
          ctx.beginPath()
          ctx.ellipse(nx, ny, 2.5, 1.5, side * 0.3, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(0,30,60,.15)'
          ctx.fill()
        })

      ctx.restore()
    }

    const drawEyebrows = (ox, oy, breath) => {
      const eY = -48
      const eX = 40

        ;[-1, 1].forEach(side => {
          const bx = cx + ox + side * eX
          const by = cy + oy + breath + eY

          ctx.save()
          ctx.translate(bx, by)
          ctx.rotate(state.headTilt)

          // Brow ridge shadow
          const browG = ctx.createLinearGradient(0, -4, 0, 6)
          browG.addColorStop(0, 'rgba(0,40,80,.08)')
          browG.addColorStop(0.5, 'rgba(0,60,100,.12)')
          browG.addColorStop(1, 'transparent')
          ctx.beginPath()
          ctx.ellipse(0, 2, 28, 8, side * -0.1, 0, Math.PI * 2)
          ctx.fillStyle = browG
          ctx.fill()

          // Eyebrow line
          ctx.beginPath()
          ctx.moveTo(-22, 0)
          ctx.bezierCurveTo(-15, -5 - side * 1, 10, -6 + side * 0.5, 22, -2)
          ctx.strokeStyle = 'rgba(0,200,240,.3)'
          ctx.lineWidth = 1.5
          ctx.stroke()

          ctx.restore()
        })
    }

    const drawEyes = (ox, oy, breath) => {
      const eY = -26
      const eX = 40
      const EW = 22
      const EH = 13
      const rotShiftX = state.rotY * 30

      // Parallax: eyes move slightly more than face
      const pOx = ox * 1.12
      const pOy = oy * 1.08

        ;[-1, 1].forEach(side => {
          const ex = cx + pOx + side * eX
          const ey = cy + pOy + breath + eY

          ctx.save()

          // Eye socket shadow for depth
          const socketG = ctx.createRadialGradient(ex, ey, EW * 0.3, ex, ey, EW * 1.5)
          socketG.addColorStop(0, 'rgba(0,30,60,.12)')
          socketG.addColorStop(0.5, 'rgba(0,20,40,.06)')
          socketG.addColorStop(1, 'transparent')
          ctx.fillStyle = socketG
          ctx.beginPath()
          ctx.ellipse(ex, ey, EW * 1.3, EH * 1.8, 0, 0, Math.PI * 2)
          ctx.fill()

          // Eye clipping
          ctx.beginPath()
          ctx.moveTo(ex - EW, ey)
          ctx.bezierCurveTo(ex - EW * 0.6, ey - EH * state.blinkState * 1.1, ex + EW * 0.6, ey - EH * state.blinkState * 1.1, ex + EW, ey)
          ctx.bezierCurveTo(ex + EW * 0.5, ey + EH * state.blinkState * 0.6, ex - EW * 0.5, ey + EH * state.blinkState * 0.6, ex - EW, ey)
          ctx.closePath()
          ctx.clip()

          // Sclera with depth gradient
          const scl = ctx.createRadialGradient(ex + state.lookX * 3, ey + state.lookY * 2, 1, ex, ey, EW)
          scl.addColorStop(0, 'rgba(230,252,255,.94)')
          scl.addColorStop(0.4, 'rgba(200,242,250,.85)')
          scl.addColorStop(0.7, 'rgba(150,215,235,.7)')
          scl.addColorStop(1, 'rgba(80,170,200,.4)')
          ctx.beginPath()
          ctx.ellipse(ex, ey, EW, EH, 0, 0, Math.PI * 2)
          ctx.fillStyle = scl
          ctx.fill()

          // Iris with more 3D depth rings
          const ix = ex + state.lookX * 4
          const iy = ey + state.lookY * 2.5
          const irisR = 8.5

          // Iris outer glow
          const irisOuter = ctx.createRadialGradient(ix, iy, irisR * 0.8, ix, iy, irisR * 1.3)
          irisOuter.addColorStop(0, 'rgba(0,100,180,.15)')
          irisOuter.addColorStop(1, 'transparent')
          ctx.beginPath()
          ctx.arc(ix, iy, irisR * 1.3, 0, Math.PI * 2)
          ctx.fillStyle = irisOuter
          ctx.fill()

          const irisg = ctx.createRadialGradient(ix - 1.5, iy - 1.5, 0.5, ix, iy, irisR)
          irisg.addColorStop(0, 'rgba(200,250,255,.97)')
          irisg.addColorStop(0.1, 'rgba(80,230,255,.95)')
          irisg.addColorStop(0.3, 'rgba(0,180,240,.9)')
          irisg.addColorStop(0.55, 'rgba(0,120,200,.85)')
          irisg.addColorStop(0.75, 'rgba(0,60,160,.75)')
          irisg.addColorStop(1, 'rgba(0,20,80,.6)')
          ctx.beginPath()
          ctx.arc(ix, iy, irisR, 0, Math.PI * 2)
          ctx.fillStyle = irisg
          ctx.fill()

          // Iris detail lines for 3D texture
          ctx.globalAlpha = 0.12
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
            ctx.beginPath()
            ctx.moveTo(ix + Math.cos(a) * 3, iy + Math.sin(a) * 3)
            ctx.lineTo(ix + Math.cos(a) * irisR * 0.9, iy + Math.sin(a) * irisR * 0.9)
            ctx.strokeStyle = '#00d0ff'
            ctx.lineWidth = 0.4
            ctx.stroke()
          }
          ctx.globalAlpha = 1

          // Pupil with depth
          const pupilR = 3.8 + state.mouthOpen * 0.4
          const pupilG = ctx.createRadialGradient(ix, iy, 0, ix, iy, pupilR)
          pupilG.addColorStop(0, 'rgba(0,0,5,1)')
          pupilG.addColorStop(0.7, 'rgba(0,0,10,1)')
          pupilG.addColorStop(1, 'rgba(0,20,40,.85)')
          ctx.beginPath()
          ctx.arc(ix, iy, pupilR, 0, Math.PI * 2)
          ctx.fillStyle = pupilG
          ctx.fill()

          // Specular highlights (multiple for 3D)
          ctx.beginPath()
          ctx.ellipse(ix - 2.5, iy - 2.8, 2.2, 1.6, -0.6, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255,255,255,.95)'
          ctx.fill()

          // Secondary smaller specular
          ctx.beginPath()
          ctx.ellipse(ix + 2, iy + 1.5, 1, 0.7, 0.3, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(200,240,255,.4)'
          ctx.fill()

          ctx.restore()

          // Eyelid outline with glow
          ctx.save()
          ctx.shadowColor = '#00e0ff'
          ctx.shadowBlur = 4
          ctx.beginPath()
          ctx.moveTo(ex - EW, ey)
          ctx.bezierCurveTo(ex - EW * 0.6, ey - EH * state.blinkState * 1.1, ex + EW * 0.6, ey - EH * state.blinkState * 1.1, ex + EW, ey)
          ctx.strokeStyle = 'rgba(0,230,255,.85)'
          ctx.lineWidth = 1.3
          ctx.stroke()
          ctx.shadowBlur = 0

          // Lower eyelid (subtle)
          ctx.beginPath()
          ctx.moveTo(ex - EW * 0.8, ey + 1)
          ctx.bezierCurveTo(ex - EW * 0.3, ey + EH * state.blinkState * 0.5, ex + EW * 0.3, ey + EH * state.blinkState * 0.5, ex + EW * 0.8, ey + 1)
          ctx.strokeStyle = 'rgba(0,200,240,.25)'
          ctx.lineWidth = 0.7
          ctx.stroke()
          ctx.restore()
        })
    }

    const drawMouth = (ox, oy, breath) => {
      const mY = 50
      const mW = 30
      const emotion = 0.15 + Math.sin(state.emotionT * 0.2) * 0.1
      const cornerLift = emotion * 0.8
      const openH = state.mouthOpen * 14

      // Parallax: mouth moves slightly less than face
      const pOx = ox * 0.92
      const pOy = oy * 0.94

      ctx.save()
      ctx.translate(cx + pOx, cy + pOy + breath)
      ctx.rotate(state.headTilt)

      // Mouth shadow area for depth
      const mShadow = ctx.createRadialGradient(0, mY + 3, 2, 0, mY + 3, 35)
      mShadow.addColorStop(0, 'rgba(0,20,40,.1)')
      mShadow.addColorStop(0.6, 'rgba(0,15,30,.05)')
      mShadow.addColorStop(1, 'transparent')
      ctx.fillStyle = mShadow
      ctx.fillRect(-40, mY - 12, 80, 35)

      // Mouth glow when speaking
      if (state.mouthOpen > 0.05) {
        const mg = ctx.createRadialGradient(0, mY + 2, 0, 0, mY + 2, 45)
        mg.addColorStop(0, `rgba(0,200,255,${0.2 * state.mouthOpen})`)
        mg.addColorStop(0.4, `rgba(0,150,220,${0.1 * state.mouthOpen})`)
        mg.addColorStop(1, 'transparent')
        ctx.fillStyle = mg
        ctx.fillRect(-48, mY - 20, 96, 48)

        // Inner mouth glow (3D depth)
        if (openH > 2) {
          const innerG = ctx.createRadialGradient(0, mY + openH * 0.3, 1, 0, mY + openH * 0.3, mW * 0.8)
          innerG.addColorStop(0, `rgba(0,60,120,${0.3 * state.mouthOpen})`)
          innerG.addColorStop(0.5, `rgba(0,40,80,${0.15 * state.mouthOpen})`)
          innerG.addColorStop(1, 'transparent')
          ctx.beginPath()
          ctx.ellipse(0, mY + openH * 0.2, mW * 0.7, openH * 0.4, 0, 0, Math.PI * 2)
          ctx.fillStyle = innerG
          ctx.fill()
        }
      }

      // Upper lip
      ctx.beginPath()
      ctx.moveTo(-mW, mY + cornerLift)
      ctx.bezierCurveTo(-mW * 0.6, mY - 3 - cornerLift, -mW * 0.2, mY - 6, 0, mY - 3)
      ctx.bezierCurveTo(mW * 0.2, mY - 6, mW * 0.6, mY - 3 - cornerLift, mW, mY + cornerLift)
      ctx.strokeStyle = 'rgba(0,220,255,.8)'
      ctx.lineWidth = 1.3
      ctx.shadowColor = '#00e0ff'
      ctx.shadowBlur = 6
      ctx.stroke()
      ctx.shadowBlur = 0

      // Lower lip
      ctx.beginPath()
      ctx.moveTo(-mW, mY + cornerLift)
      ctx.bezierCurveTo(-mW * 0.5, mY + 4 + openH + cornerLift, mW * 0.5, mY + 4 + openH + cornerLift, mW, mY + cornerLift)
      ctx.strokeStyle = 'rgba(0,200,255,.6)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Lip highlight (3D)
      ctx.beginPath()
      ctx.moveTo(-mW * 0.5, mY - 4)
      ctx.bezierCurveTo(-mW * 0.2, mY - 7, mW * 0.2, mY - 7, mW * 0.5, mY - 4)
      ctx.strokeStyle = 'rgba(150,240,255,.15)'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.restore()
    }

    const drawHolographicOverlay = (ox, oy, breath) => {
      // Additional holographic chromatic aberration effect
      ctx.save()
      ctx.globalCompositeOperation = 'screen'

      // Subtle color shift duplicates for holographic feel
      const flickerAmt = Math.sin(state.t * 5) * 0.5 + 0.5
      if (flickerAmt > 0.85) {
        ctx.globalAlpha = 0.04
        ctx.drawImage(canvas, -1, 0)
        ctx.fillStyle = 'rgba(255,0,100,0.02)'
        ctx.fillRect(0, 0, W, H)
      }

      // Vignette for depth
      ctx.globalCompositeOperation = 'source-over'
      const vignette = ctx.createRadialGradient(cx, cy, fW * 0.8, cx, cy, W * 0.7)
      vignette.addColorStop(0, 'transparent')
      vignette.addColorStop(0.7, 'transparent')
      vignette.addColorStop(1, 'rgba(0,4,10,.4)')
      ctx.globalAlpha = 1
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, W, H)

      ctx.restore()
    }

    const animate = () => {
      state.t += 0.016
      state.breathPhase += 0.018
      state.emotionT += 0.016
      state.sssFlicker = Math.sin(state.t * 3.1) * 0.3 + 0.7

      // Blink logic
      state.blinkTimer += 0.016
      if (state.blinkTimer >= state.nextBlink) {
        state.blinkTimer = 0
        state.nextBlink = 2.5 + Math.random() * 5
        state.doubleBlink = Math.random() < 0.22
      }

      const bp = state.blinkTimer
      const blinkDur = 0.11
      if (state.doubleBlink) {
        if (bp < blinkDur) state.blinkState = Math.max(0, 1 - bp / blinkDur * 2)
        else if (bp < blinkDur * 2) state.blinkState = Math.min(1, (bp - blinkDur) / blinkDur * 2)
        else if (bp < blinkDur * 3 + 0.08) state.blinkState = Math.max(0, 1 - (bp - blinkDur * 2 - 0.08) / blinkDur * 2)
        else if (bp < blinkDur * 4 + 0.08) state.blinkState = Math.min(1, (bp - blinkDur * 3 - 0.08) / blinkDur * 2)
        else state.blinkState = 1
      } else {
        if (bp < blinkDur) state.blinkState = Math.max(0, 1 - bp / blinkDur * 2)
        else if (bp < blinkDur * 2) state.blinkState = Math.min(1, (bp - blinkDur) / blinkDur * 2)
        else state.blinkState = 1
      }

      // Head movement (enhanced for 3D)
      if (Math.random() < 0.004) {
        state.headXTarget = (Math.random() - 0.5) * 7
        state.headYTarget = (Math.random() - 0.5) * 5
        state.headTiltTarget = (Math.random() - 0.5) * 0.025
      }
      if (Math.random() < 0.005) {
        state.lookX = (Math.random() - 0.5) * 1.2
        state.lookY = (Math.random() - 0.5) * 0.8
      }
      // 3D rotation targets
      if (Math.random() < 0.003) {
        state.rotYTarget = (Math.random() - 0.5) * 0.3
        state.rotXTarget = (Math.random() - 0.5) * 0.15
      }

      state.headX = lerp(state.headX, state.headXTarget, 0.025)
      state.headY = lerp(state.headY, state.headYTarget, 0.025)
      state.headTilt = lerp(state.headTilt, state.headTiltTarget, 0.02)
      state.lookX = lerp(state.lookX, 0, 0.008)
      state.lookY = lerp(state.lookY, 0, 0.008)
      state.rotY = lerp(state.rotY, state.rotYTarget, 0.015)
      state.rotX = lerp(state.rotX, state.rotXTarget, 0.015)

      // Mouth & speaking
      if (isSpeaking) {
        const tgt = 0.25 + Math.random() * 0.75
        state.mouthOpen = lerp(state.mouthOpen, tgt, 0.28)
        state.speakIntensity = lerp(state.speakIntensity, 0.6 + Math.random() * 0.4, 0.18)
      } else {
        state.mouthOpen = lerp(state.mouthOpen, 0, 0.12)
        state.speakIntensity = lerp(state.speakIntensity, 0, 0.09)
      }

      const breath = Math.sin(state.breathPhase) * 0.9
      const ox = state.headX
      const oy = state.headY

      drawBG()
      drawParticles()
      drawFace(ox, oy, breath)
      drawNose(ox, oy, breath)
      drawEyebrows(ox, oy, breath)
      drawEyes(ox, oy, breath)
      drawMouth(ox, oy, breath)
      drawScanLines(ox, oy, breath)
      drawHolographicOverlay(ox, oy, breath)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isSpeaking])

  return (
    <div className="avatar-frame">
      <div className="holo-depth-layer holo-depth-back"></div>
      <div className="holo-depth-layer holo-depth-mid"></div>
      <div className="corner-br"></div>
      <div className="corner-bl"></div>
      <div className="glow-orb"></div>
      <div className="ring"></div>
      <div className="ring"></div>
      <canvas ref={canvasRef} className="head-canvas" />
      <div className="holo-flicker"></div>
    </div>
  )
}

export default HolographicAvatar
