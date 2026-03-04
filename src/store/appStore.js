import { create } from 'zustand'

export const useAppStore = create((set, get) => ({
  // UI State
  status: 'ONLINE',
  isSpeaking: false,
  isTyping: false,
  isProcessing: false,
  isMuted: false,
  settingsOpen: false,

  // Chat State
  messages: [],
  conversationHistory: [],

  // Voice State
  wakeState: 'idle', // 'idle' | 'awake' | 'capturing' | 'unsupported'
  wakeEnabled: false,
  showWakeToast: false,
  showPermBanner: false,
  selectedVoice: null,
  pitch: 0.9,
  rate: 1.0,

  // Avatar State
  speakIntensity: 0,

  // Actions
  setStatus: (status, speaking = false) => set({
    status,
    isSpeaking: speaking
  }),

  setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
  setIsTyping: (isTyping) => set({ isTyping }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),

  addMessage: (role, text) => set((state) => ({
    messages: [...state.messages, {
      id: Date.now(),
      role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]
  })),

  clearMessages: () => set({
    messages: [],
    conversationHistory: []
  }),

  addToHistory: (role, text) => set((state) => ({
    conversationHistory: [...state.conversationHistory, {
      role,
      parts: [{ text }]
    }]
  })),

  setWakeState: (wakeState) => set({ wakeState }),
  setWakeEnabled: (wakeEnabled) => set({ wakeEnabled }),
  setShowWakeToast: (showWakeToast) => set({ showWakeToast }),
  setShowPermBanner: (showPermBanner) => set({ showPermBanner }),

  setVoiceSettings: (settings) => set(settings),

  setSpeakIntensity: (speakIntensity) => set({ speakIntensity }),

  initializeApp: () => {
    // Initialization handled in components
  }
}))
