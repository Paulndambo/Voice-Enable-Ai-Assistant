# 🚀 Quick Start Guide

Get Gideon AI Assistant running in 3 simple steps!

## Prerequisites

- Node.js 18 or higher ([Download here](https://nodejs.org/))
- A modern web browser (Chrome, Edge, or Safari recommended)

## Installation

### Step 1: Install Dependencies

```bash
npm install
```

⏱️ *Takes about 1-2 minutes*

### Step 2: Start the App

```bash
npm run dev
```

🎉 *The app will automatically open in your browser at http://localhost:3000*

### Step 3: Enable Microphone (Optional)

When prompted, click **"ENABLE MIC"** to use voice features.

## That's It! 🎊

You should now see Gideon's holographic interface. Try:

- 💬 **Type a message** in the input box
- 🎤 **Say "Gideon"** to activate voice input
- 🎯 **Click quick chips** for example queries
- ⚙️ **Adjust voice settings** with the gear icon

## Common Issues

### Port Already in Use?

```bash
# Kill the process using port 3000
npx kill-port 3000

# Then try again
npm run dev
```

### Dependencies Not Installing?

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Voice Not Working?

1. Use Chrome or Edge browser (best support)
2. Ensure microphone permissions are granted
3. Check that you're on `localhost` or `https://`

## Next Steps

- 📖 Read [README.md](README.md) for full documentation
- 🔧 Check [SETUP.md](SETUP.md) for detailed setup
- 📊 Review [CONVERSION_SUMMARY.md](CONVERSION_SUMMARY.md) for technical details

## Build for Production

When ready to deploy:

```bash
npm run build
```

Output will be in the `dist/` folder, ready to deploy to any static hosting service.

---

**Need Help?** Check the browser console (F12) for error messages.

**Enjoy using Gideon! 🤖✨**
