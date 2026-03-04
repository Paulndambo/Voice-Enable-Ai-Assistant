import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import './styles/ChatInput.css'

const detectGender = (voiceName = '') => {
  const name = voiceName.toLowerCase()
  const femaleHints = ['female', 'woman', 'zira', 'samantha', 'karen', 'moira', 'fiona', 'aria', 'jenny', 'libby', 'hazel', 'susan']
  const maleHints = ['male', 'man', 'daniel', 'david', 'george', 'ryan', 'guy', 'thomas', 'james']

  if (femaleHints.some(h => name.includes(h))) return 'female'
  if (maleHints.some(h => name.includes(h))) return 'male'
  return 'unknown'
}

const voiceRank = (voice) => {
  const name = voice.name.toLowerCase()
  const isEnglish = voice.lang.toLowerCase().startsWith('en')
  const isUK = voice.lang.toLowerCase().startsWith('en-gb') || name.includes('uk') || name.includes('british')
  const gender = detectGender(voice.name)

  let score = 0
  if (isEnglish) score += 100
  if (isUK) score += 200
  if (gender === 'female') score += 30
  if (gender === 'male') score += 20
  if (name.includes('google')) score += 8

  return score
}

const ChatInput = ({ value, onChange, onSend, onMicClick }) => {
  const textareaRef = useRef(null)
  const {
    settingsOpen,
    toggleSettings,
    wakeState,
    pitch,
    rate,
    setVoiceSettings
  } = useAppStore()

  const { getVoices } = useSpeechSynthesis()

  const [voiceOptions, setVoiceOptions] = React.useState([])
  const [selectedVoiceIndex, setSelectedVoiceIndex] = React.useState(0)

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = getVoices()
      if (availableVoices.length > 0) {
        const options = availableVoices
          .map((voice, index) => ({
            voice,
            index,
            gender: detectGender(voice.name),
            rank: voiceRank(voice)
          }))
          .sort((a, b) => b.rank - a.rank || a.voice.name.localeCompare(b.voice.name))

        setVoiceOptions(options)

        // Prefer UK Female, then UK Male, then high-ranked English option.
        const preferred = options.find(o =>
          o.voice.lang.toLowerCase().startsWith('en-gb') && o.gender === 'female'
        ) || options.find(o =>
          o.voice.lang.toLowerCase().startsWith('en-gb') && o.gender === 'male'
        ) || options[0]

        if (preferred) {
          setSelectedVoiceIndex(preferred.index)
          setVoiceSettings({ selectedVoice: preferred.index })
        }
      }
    }

    loadVoices()
    // Retry after a delay in case voices aren't loaded yet
    const timer = setTimeout(loadVoices, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const handleInput = (e) => {
    onChange(e.target.value)
    // Auto-resize
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'
  }

  const handleMicClick = () => {
    onMicClick?.()
  }

  const handleVoiceChange = (e) => {
    const index = parseInt(e.target.value)
    setSelectedVoiceIndex(index)
    setVoiceSettings({ selectedVoice: index })
  }

  const handlePitchChange = (e) => {
    setVoiceSettings({ pitch: parseFloat(e.target.value) })
  }

  const handleRateChange = (e) => {
    setVoiceSettings({ rate: parseFloat(e.target.value) })
  }

  const getMicButtonClass = () => {
    let className = 'mic-btn'
    if (wakeState === 'capturing') className += ' listening'
    return className
  }

  return (
    <div className="chat-footer">
      {/* Voice Settings Row */}
      <motion.div
        className={`settings-row ${settingsOpen ? 'open' : ''}`}
        initial={false}
        animate={{
          maxHeight: settingsOpen ? 56 : 0,
          opacity: settingsOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
      >
        <select
          className="voice-select"
          value={selectedVoiceIndex}
          onChange={handleVoiceChange}
        >
          {voiceOptions.length === 0 ? (
            <option>Loading voices…</option>
          ) : (
            voiceOptions.map(({ voice, index, gender }) => (
              <option key={`${voice.name}-${index}`} value={index}>
                {voice.name} ({voice.lang}) {gender === 'unknown' ? '' : `· ${gender}`}
              </option>
            ))
          )}
        </select>

        <div className="ctrl-mini">
          <label>PITCH</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.05"
            value={pitch}
            onChange={handlePitchChange}
          />
        </div>

        <div className="ctrl-mini">
          <label>SPEED</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.05"
            value={rate}
            onChange={handleRateChange}
          />
        </div>
      </motion.div>

      {/* Input Row */}
      <div className="input-row">
        <div className="input-wrap">
          <textarea
            ref={textareaRef}
            className="user-input"
            placeholder="Ask Gideon anything…"
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
          />
        </div>

        <div className="action-btns">
          <motion.button
            className="send-btn"
            onClick={onSend}
            disabled={!value.trim()}
            title="Send (Enter)"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ➤
          </motion.button>

          <motion.button
            className={getMicButtonClass()}
            onClick={handleMicClick}
            title={wakeState === 'capturing' ? 'Stop listening' : 'Click to speak'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {wakeState === 'capturing' ? '🎙' : '🎤'}
          </motion.button>

          <motion.button
            className={`cog-btn ${settingsOpen ? 'open' : ''}`}
            onClick={toggleSettings}
            title="Voice settings"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ⚙
          </motion.button>
        </div>
      </div>

      {/* Footer Hint */}
      <div className="footer-hint">
        <span>
          <kbd>Enter</kbd> send &nbsp; <kbd>Shift</kbd>+<kbd>Enter</kbd> new line
        </span>
        <span className="powered">Gemini 2.5 Flash · Web Speech API</span>
      </div>
    </div>
  )
}

export default ChatInput
