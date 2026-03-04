import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/appStore'

const cleanText = (text) => {
  return text
    // Aggressively strip all markdown characters that shouldn't be spoken
    .replace(/[*_#`~]+/g, '')
    // Clean up multiple newlines and spaces
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

const SPEAK_START_DELAY_MS = 150

const detectGender = (voiceName = '') => {
  const name = voiceName.toLowerCase()
  const femaleHints = ['female', 'woman', 'zira', 'samantha', 'karen', 'moira', 'fiona', 'aria', 'jenny', 'libby', 'hazel', 'susan']
  const maleHints = ['male', 'man', 'daniel', 'david', 'george', 'ryan', 'guy', 'thomas', 'james']

  if (femaleHints.some(h => name.includes(h))) return 'female'
  if (maleHints.some(h => name.includes(h))) return 'male'
  return 'unknown'
}

const scoreVoice = (voice) => {
  const name = voice.name.toLowerCase()
  const lang = voice.lang.toLowerCase()
  const isEnglish = lang.startsWith('en')
  const isUK = lang.startsWith('en-gb') || name.includes('uk') || name.includes('british')
  const gender = detectGender(voice.name)

  let score = 0
  if (isEnglish) score += 100
  if (isUK) score += 200
  if (gender === 'female') score += 30
  if (gender === 'male') score += 20
  if (name.includes('google')) score += 8

  return score
}

const pickPreferredVoice = (voices) => {
  if (!voices.length) return null

  const sorted = [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a))
  const ukFemale = sorted.find(v => v.lang.toLowerCase().startsWith('en-gb') && detectGender(v.name) === 'female')
  const ukMale = sorted.find(v => v.lang.toLowerCase().startsWith('en-gb') && detectGender(v.name) === 'male')

  return ukFemale || ukMale || sorted[0]
}

export const useSpeechSynthesis = () => {
  const synth = useRef(window.speechSynthesis)
  const voicesRef = useRef([])
  const audioUnlockedRef = useRef(false)

  const {
    isMuted,
    selectedVoice,
    pitch,
    rate,
    setIsSpeaking,
    setStatus
  } = useAppStore()

  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = synth.current.getVoices()
    }

    loadVoices()
    synth.current.onvoiceschanged = loadVoices

    return () => {
      synth.current.cancel()
    }
  }, [])

  const unlockAudio = () => {
    if (audioUnlockedRef.current) return
    audioUnlockedRef.current = true
    const utterance = new SpeechSynthesisUtterance('')
    utterance.volume = 0
    synth.current.speak(utterance)
  }

  const speak = (text) => {
    if (isMuted) return

    synth.current.cancel()

    // Delay new utterance slightly so cancel() fully clears prior speech in Chrome.
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(cleanText(text))

      const voices = voicesRef.current
      if (selectedVoice !== null && voices[selectedVoice]) {
        utterance.voice = voices[selectedVoice]
      } else {
        // Prefer UK female/male voices, then other high-quality English voices.
        const preferredVoice = pickPreferredVoice(voices)
        if (preferredVoice) utterance.voice = preferredVoice
      }

      utterance.pitch = pitch
      utterance.rate = rate
      utterance.volume = 1

      utterance.onstart = () => {
        setIsSpeaking(true)
        setStatus('SPEAKING', true)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setStatus('ONLINE', false)
      }

      utterance.onerror = (e) => {
        setIsSpeaking(false)
        if (e.error !== 'interrupted') {
          setStatus('VOICE ERR', false)
        } else {
          setStatus('ONLINE', false)
        }
      }

      synth.current.speak(utterance)
    }, SPEAK_START_DELAY_MS)
  }

  const cancel = () => {
    synth.current.cancel()
    setIsSpeaking(false)
  }

  const getVoices = () => voicesRef.current

  return {
    speak,
    cancel,
    unlockAudio,
    getVoices
  }
}
