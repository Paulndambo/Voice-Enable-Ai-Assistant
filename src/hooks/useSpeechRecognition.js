import { useRef, useCallback, useEffect } from 'react'
import { useAppStore } from '../store/appStore'

export const useSpeechRecognition = (onCapture) => {
  const recognitionRef = useRef(null)

  // 'passive' | 'active'
  const modeRef = useRef('passive')
  const isListeningRef = useRef(false)
  const silenceTimerRef = useRef(null)
  const finalTranscriptRef = useRef('')
  const interimTranscriptRef = useRef('')
  const hasSubmittedRef = useRef(false)

  const onCaptureRef = useRef(onCapture)
  useEffect(() => {
    onCaptureRef.current = onCapture
  }, [onCapture])

  const {
    setWakeState,
    setStatus
  } = useAppStore()

  const isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }, [])

  const submitTranscriptOnce = useCallback(() => {
    if (modeRef.current === 'passive') return
    if (hasSubmittedRef.current || !onCaptureRef.current) return

    const transcript = `${finalTranscriptRef.current} ${interimTranscriptRef.current}`.trim()
    if (!transcript) {
      modeRef.current = 'passive'
      setWakeState('idle')
      setStatus('ONLINE', false)
      return
    }

    hasSubmittedRef.current = true
    onCaptureRef.current(transcript)

    // Switch back to passive mode
    modeRef.current = 'passive'
    setWakeState('idle')
    setStatus('ONLINE', false)
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

  const switchToActive = useCallback(() => {
    modeRef.current = 'active'
    finalTranscriptRef.current = ''
    interimTranscriptRef.current = ''
    hasSubmittedRef.current = false
    clearSilenceTimer()
    setWakeState('capturing')
    setStatus('LISTENING', false)
    playActivationTone()
  }, [clearSilenceTimer, setWakeState, setStatus, playActivationTone])

  const stopActiveListening = useCallback(({ shouldSubmit = false } = {}) => {
    if (shouldSubmit) {
      submitTranscriptOnce()
    } else {
      modeRef.current = 'passive'
      setWakeState('idle')
      setStatus('ONLINE', false)
    }
    clearSilenceTimer()
  }, [clearSilenceTimer, submitTranscriptOnce, setWakeState, setStatus])

  const scheduleSilenceStop = useCallback(() => {
    if (modeRef.current === 'passive') return
    clearSilenceTimer()
    silenceTimerRef.current = setTimeout(() => {
      stopActiveListening({ shouldSubmit: true })
    }, 1500)
  }, [clearSilenceTimer, stopActiveListening])

  const startPassiveListening = useCallback(() => {
    if (!isSupported) {
      console.error('Speech recognition not supported')
      return
    }

    if (isListeningRef.current) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'en-US'
    recognitionRef.current.maxAlternatives = 5

    isListeningRef.current = true
    finalTranscriptRef.current = ''
    interimTranscriptRef.current = ''

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
      const combined = `${finalTranscriptRef.current} ${interimTranscriptRef.current}`

      if (modeRef.current === 'passive') {
        if (/\bgideon\b/i.test(combined)) {
          switchToActive()
        }
      } else {
        if (hasAnySpeech) {
          scheduleSilenceStop()
        }
      }
    }

    recognitionRef.current.onerror = (e) => {
      if (e.error === 'no-speech') return
      console.error('Recognition error:', e.error)

      if (e.error === 'not-allowed' || e.error === 'audio-capture') {
        isListeningRef.current = false
        setStatus(`MIC: ${e.error === 'not-allowed' ? 'Permission denied' : 'No audio'}`, false)
      }
    }

    recognitionRef.current.onend = () => {
      isListeningRef.current = false

      if (modeRef.current === 'active') {
        submitTranscriptOnce()
      }

      // Always try to restart for continuous passive listening
      setTimeout(() => {
        if (!isListeningRef.current && isSupported) {
          try {
            recognitionRef.current.start()
            isListeningRef.current = true
          } catch (e) { }
        }
      }, 100)
    }

    try {
      recognitionRef.current.start()
    } catch (e) {
      console.error('Start error:', e)
      isListeningRef.current = false
    }
  }, [isSupported, setStatus, switchToActive, scheduleSilenceStop, submitTranscriptOnce])

  // Automatically start passive listening on mount
  useEffect(() => {
    if (isSupported) {
      startPassiveListening()
    }
    return () => {
      clearSilenceTimer()
      try {
        recognitionRef.current?.abort()
      } catch (e) { }
    }
  }, [startPassiveListening, isSupported, clearSilenceTimer])

  // Manual trigger (e.g., clicking the microphone button)
  const triggerActive = useCallback(() => {
    if (!isListeningRef.current && isSupported) {
      try {
        recognitionRef.current?.start()
        isListeningRef.current = true
      } catch (e) { }
    }
    switchToActive()
  }, [isSupported, switchToActive])

  return {
    isSupported,
    startListening: triggerActive,
    stopListening: stopActiveListening,
    isListening: isListeningRef.current
  }
}
