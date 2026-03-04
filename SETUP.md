# Setup Guide for Gideon AI Assistant

## Quick Start

Follow these steps to get the application running:

### 1. Install Dependencies

```bash
npm install
```

This will install:
- React 18.3.1
- React DOM 18.3.1
- Framer Motion 11.0.8 (for animations)
- Zustand 4.5.2 (for state management)
- Vite 5.2.8 (build tool)
- @vitejs/plugin-react 4.2.1

### 2. Start Development Server

```bash
npm run dev
```

The application will open automatically at `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

### 4. Preview Production Build

```bash
npm run preview
```

## Browser Compatibility

### Required Features
- **Web Speech API** (for voice recognition)
- **Speech Synthesis API** (for voice output)
- **Canvas API** (for holographic avatar)
- **Modern JavaScript** (ES2020+)

### Recommended Browsers
- ✅ Chrome 90+ (Best experience)
- ✅ Edge 90+
- ✅ Safari 14.1+
- ⚠️ Firefox 90+ (Limited speech recognition support)

## Microphone Permissions

The application requires microphone access for voice features:

1. When prompted, click **"Allow"** to grant microphone access
2. If denied, you can still use text input
3. To re-enable: Check browser settings → Site permissions → Microphone

## Environment Variables (Optional)

For production deployments, create a `.env` file:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

Then update `src/services/geminiService.js`:

```javascript
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'fallback_key'
```

## Troubleshooting

### Voice Recognition Not Working

1. **Check Browser Support**: Use Chrome or Edge for best results
2. **Microphone Access**: Ensure permissions are granted
3. **HTTPS Required**: Speech recognition requires secure context (https:// or localhost)
4. **Check Console**: Look for error messages in browser DevTools

### Avatar Not Rendering

1. **Canvas Support**: Ensure browser supports HTML5 Canvas
2. **Hardware Acceleration**: Enable in browser settings
3. **Clear Cache**: Try hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### API Errors

1. **Check API Key**: Verify Gemini API key is valid
2. **Network Connection**: Ensure internet connectivity
3. **Rate Limits**: Check if API quota is exceeded
4. **CORS Issues**: Ensure proper API configuration

### Performance Issues

1. **Reduce Animation Quality**: Modify canvas frame rate in `HolographicAvatar.jsx`
2. **Disable Particles**: Comment out particle rendering
3. **Close Other Tabs**: Free up browser resources

## Development Tips

### Hot Module Replacement (HMR)

Vite provides instant HMR. Changes to React components will update without full page reload.

### Component Development

Each component is self-contained with its own CSS file:
- `src/components/ComponentName.jsx`
- `src/components/styles/ComponentName.css`

### State Management

Global state is managed with Zustand in `src/store/appStore.js`:

```javascript
import { useAppStore } from '../store/appStore'

const { status, setStatus } = useAppStore()
```

### Custom Hooks

Two main hooks for speech functionality:
- `useSpeechSynthesis()` - Text-to-speech
- `useSpeechRecognition()` - Speech-to-text with wake word

## Project Structure

```
gideon-ai-assistant/
├── src/
│   ├── components/
│   │   ├── AvatarPanel.jsx           # Left panel with avatar
│   │   ├── ChatPanel.jsx             # Right panel with chat
│   │   ├── HolographicAvatar.jsx     # Canvas-based avatar
│   │   ├── ChatHeader.jsx            # Chat header with controls
│   │   ├── ChatLog.jsx               # Message list
│   │   ├── ChatInput.jsx             # Input area with voice controls
│   │   ├── ProcessingOverlay.jsx     # Loading animation
│   │   ├── StatusPill.jsx            # Status indicator
│   │   ├── HUDInfo.jsx               # System information display
│   │   ├── QuickChips.jsx            # Quick action buttons
│   │   ├── WakeToast.jsx             # Wake word notification
│   │   ├── PermissionBanner.jsx      # Mic permission prompt
│   │   └── styles/                   # Component CSS files
│   ├── hooks/
│   │   ├── useSpeechSynthesis.js     # TTS hook
│   │   └── useSpeechRecognition.js   # STT hook
│   ├── services/
│   │   └── geminiService.js          # Gemini API integration
│   ├── store/
│   │   └── appStore.js               # Zustand state store
│   ├── styles/
│   │   ├── global.css                # Global styles
│   │   └── App.css                   # App layout styles
│   ├── App.jsx                       # Main app component
│   └── main.jsx                      # Entry point
├── index.html                        # HTML template
├── package.json                      # Dependencies
├── vite.config.js                    # Vite configuration
├── .eslintrc.cjs                     # ESLint config
├── .gitignore                        # Git ignore rules
├── README.md                         # Project documentation
└── SETUP.md                          # This file
```

## Customization

### Change Colors

Edit CSS variables in `src/styles/global.css`:

```css
:root {
  --cyan: #00f0ff;        /* Primary accent color */
  --bg: #030d17;          /* Background color */
  --text: #cce8f8;        /* Text color */
  /* ... more variables */
}
```

### Modify Avatar

Edit canvas rendering in `src/components/HolographicAvatar.jsx`:
- Face geometry
- Eye rendering
- Animation parameters
- Particle effects

### Adjust Voice Settings

Default settings in `src/store/appStore.js`:

```javascript
pitch: 0.9,   // Voice pitch (0.5 - 2.0)
rate: 1.0,    // Speech rate (0.5 - 2.0)
```

### Change Wake Word

Modify in `src/hooks/useSpeechRecognition.js`:

```javascript
const WAKE_WORD = 'gideon'
const WAKE_VARIANTS = ['gideon', 'pol', 'pall', 'pawl', 'pool']
```

## Deployment

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

### GitHub Pages

```bash
npm run build
# Push dist/ folder to gh-pages branch
```

## Support

For issues or questions:
1. Check browser console for errors
2. Review this setup guide
3. Check README.md for features and usage
4. Ensure all dependencies are installed correctly

## Next Steps

After setup:
1. ✅ Test voice recognition with wake word "Gideon"
2. ✅ Customize voice settings
3. ✅ Try the quick action chips
4. ✅ Explore the holographic avatar animations
5. ✅ Test on different devices and screen sizes

Enjoy using GIDEON AI Assistant! 🤖✨
