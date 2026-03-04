# Gideon — AI Assistant

A modern, futuristic AI assistant interface built with React, Vite, and the Gemini API. Features a holographic avatar, voice interaction, and real-time chat capabilities.

![Gideon AI Assistant](https://img.shields.io/badge/React-18.3-blue) ![Vite](https://img.shields.io/badge/Vite-5.2-purple) ![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11.0-pink)

## ✨ Features

- **🎨 Modern Holographic UI** - Stunning cyberpunk-inspired interface with animated holographic avatar
- **🎤 Voice Interaction** - Always-on wake word detection ("Gideon") with Web Speech API
- **🤖 AI-Powered** - Integrated with Google's Gemini 2.5 Flash for intelligent responses
- **💬 Real-time Chat** - Smooth, animated chat interface with typing indicators
- **🔊 Text-to-Speech** - Natural voice responses with customizable voice settings
- **📱 Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- **⚡ High Performance** - Optimized canvas animations and efficient state management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gideon-ai-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The optimized production build will be in the `dist` folder.

## 🎯 Usage

### Voice Interaction

1. **Enable Microphone** - Click "ENABLE MIC" when prompted to allow microphone access
2. **Wake Word** - Say "Gideon" to activate voice input
3. **Speak Your Query** - After activation, speak your question or command
4. **Listen to Response** - Gideon will respond with both text and voice

### Text Interaction

- Type your message in the input field at the bottom
- Press `Enter` to send (or `Shift + Enter` for new line)
- Click the send button (➤) to submit your message

### Voice Settings

- Click the settings gear (⚙) to customize voice output
- Adjust pitch and speed sliders
- Select from available system voices

## 🏗️ Project Structure

```
gideon-ai-assistant/
├── src/
│   ├── components/          # React components
│   │   ├── AvatarPanel.jsx
│   │   ├── ChatPanel.jsx
│   │   ├── HolographicAvatar.jsx
│   │   └── styles/          # Component-specific CSS
│   ├── hooks/               # Custom React hooks
│   │   ├── useSpeechSynthesis.js
│   │   └── useSpeechRecognition.js
│   ├── services/            # API services
│   │   └── geminiService.js
│   ├── store/               # State management (Zustand)
│   │   └── appStore.js
│   ├── styles/              # Global styles
│   │   ├── global.css
│   │   └── App.css
│   ├── App.jsx              # Main App component
│   └── main.jsx             # Entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🛠️ Technologies

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Framer Motion** - Animation library
- **Zustand** - State management
- **Web Speech API** - Voice recognition and synthesis
- **Gemini API** - AI language model
- **Canvas API** - Holographic avatar rendering

## 🎨 UI/UX Improvements

This React version includes several enhancements over the original:

1. **Component Architecture** - Modular, reusable components for better maintainability
2. **State Management** - Centralized state with Zustand for predictable updates
3. **Smooth Animations** - Framer Motion for fluid, performant animations
4. **Better Accessibility** - Proper focus management and keyboard navigation
5. **Improved Responsiveness** - Enhanced mobile experience with touch interactions
6. **Error Handling** - Graceful error states and user feedback
7. **Performance** - Optimized re-renders and canvas animations

## 🔧 Configuration

### API Key

The Gemini API key is currently hardcoded in `src/services/geminiService.js`. For production use, consider:

1. Using environment variables:
```javascript
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY
```

2. Creating a `.env` file:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

### Voice Settings

Default voice settings can be adjusted in `src/store/appStore.js`:
```javascript
pitch: 0.9,  // 0.5 to 2.0
rate: 1.0,   // 0.5 to 2.0
```

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

Created with ❤️ using React and Vite

---

**Note:** This application requires microphone access for voice features and an active internet connection for AI responses.