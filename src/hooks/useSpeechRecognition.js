import { useRef, useCallback, useEffect } from 'react'
import { useAppStore } from '../store/appStore'

export const useSpeechRecognition = (onCapture) => {
  const recognitionRef = useRef(null)
  const isListeningRef = useRef(false)
  const timeoutRef = useRef(null)      // 20s hard max
  const silenceTimerRef = useRef(null) // 2s silence auto-submit
  const finalTranscriptRef = useRef('')
  const interimTranscriptRef = useRef('')

  // Keep onCapture stable across renders
  const onCaptureRef = useRef(onCapture)
  useEffect(() => {
    onCaptureRef.current = onCapture
  }, [onCapture])

  const { setWakeState, setStatus } = useAppStore()

  const isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

  const stopListening = useCallback(({ submit = false } = {}) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) { /* ignore */ }
    }

    isListeningRef.current = false
    setWakeState('idle')
    setStatus('ONLINE', false)

    if (submit) {
      const transcript = `${finalTranscriptRef.current} ${interimTranscriptRef.current}`.trim()
      if (transcript && onCaptureRef.current) {
        onCaptureRef.current(transcript)
      }
    }

    finalTranscriptRef.current = ''
    interimTranscriptRef.current = ''
  }, [setWakeState, setStatus])

  const playActivationTone = useCallback(() => {
    try {
      const actx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = actx.createOscillator()
      const gain = actx.createGain()
      osc.connect(gain)
      gain.connect(actx.destination)
      osc.type = 'sine'
      osc.frequency.value = 880
      const start = actx.currentTime
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.15, start + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2)
      osc.start(start)
      osc.stop(start + 0.25)
    } catch (e) {
      console.error('Activation tone error:', e)
    }
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) {
      console.error('Speech recognition not supported')
      return
    }

    // If already listening, stop it first
    if (isListeningRef.current) {
      stopListening({ submit: false })
      return
    }

    finalTranscriptRef.current = ''
    interimTranscriptRef.current = ''

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'en-US'
    recognitionRef.current.maxAlternatives = 1

    recognitionRef.current.onstart = () => {
      isListeningRef.current = true
      setWakeState('capturing')
      setStatus('LISTENING', false)
      playActivationTone()

      // Auto-stop after 20 seconds
      timeoutRef.current = setTimeout(() => {
        stopListening({ submit: true })
      }, 20000)
    }

    recognitionRef.current.onresult = (e) => {
      let interimTranscript = ''
      let hasAnySpeech = false

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript.trim()
        if (!transcript) continue
        hasAnySpeech = true
        if (e.results[i].isFinal) {
          finalTranscriptRef.current += `${transcript} `
        } else {
          interimTranscript += transcript
        }
      }

      interimTranscriptRef.current = interimTranscript

      // Reset silence timer every time we get speech
      if (hasAnySpeech) {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = setTimeout(() => {
          stopListening({ submit: true })
        }, 2000)
      }
    }

    recognitionRef.current.onerror = (e) => {
      if (e.error === 'no-speech') return
      console.error('Recognition error:', e.error)

      if (e.error === 'not-allowed' || e.error === 'audio-capture') {
        stopListening({ submit: false })
        setStatus(`MIC: ${e.error === 'not-allowed' ? 'Permission denied' : 'No audio'}`, false)
      }
    }

    recognitionRef.current.onend = () => {
      // If ended unexpectedly while we're still in a listening session, submit what we got
      if (isListeningRef.current) {
        stopListening({ submit: true })
      }
    }

    try {
      recognitionRef.current.start()
    } catch (e) {
      console.error('Start error:', e)
      isListeningRef.current = false
    }
  }, [isSupported, setWakeState, setStatus, playActivationTone, stopListening])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      try { recognitionRef.current?.abort() } catch (e) { /* ignore */ }
    }
  }, [])

  return {
    isSupported,
    startListening,
    stopListening,
    isListening: isListeningRef.current
  }
}
