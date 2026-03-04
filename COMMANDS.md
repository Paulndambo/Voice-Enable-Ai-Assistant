# 📝 Command Reference

Quick reference for all npm commands and useful shortcuts.

## 🚀 Development Commands

### Start Development Server
```bash
npm run dev
```
- Starts Vite dev server
- Opens browser automatically at http://localhost:3000
- Hot Module Replacement (HMR) enabled
- Fast refresh on file changes

### Build for Production
```bash
npm run build
```
- Creates optimized production build
- Output in `dist/` folder
- Minified and compressed
- Ready for deployment

### Preview Production Build
```bash
npm run preview
```
- Serves production build locally
- Test before deployment
- Runs on http://localhost:4173

### Lint Code
```bash
npm run lint
```
- Runs ESLint on all files
- Checks for code quality issues
- Reports unused variables, etc.

## 📦 Package Management

### Install Dependencies
```bash
npm install
```
or
```bash
npm i
```

### Install Specific Package
```bash
npm install package-name
```

### Install Dev Dependency
```bash
npm install -D package-name
```

### Update Dependencies
```bash
npm update
```

### Check for Outdated Packages
```bash
npm outdated
```

### Remove Package
```bash
npm uninstall package-name
```

## 🧹 Maintenance Commands

### Clear npm Cache
```bash
npm cache clean --force
```

### Reinstall All Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Kill Port 3000 (if occupied)
```bash
npx kill-port 3000
```

### Check Node Version
```bash
node --version
```

### Check npm Version
```bash
npm --version
```

## 🔧 Vite-Specific Commands

### Build with Source Maps
```bash
npm run build -- --sourcemap
```

### Build with Custom Base Path
```bash
npm run build -- --base=/my-app/
```

### Preview with Custom Port
```bash
npm run preview -- --port 8080
```

## 🐛 Debugging Commands

### Run with Verbose Logging
```bash
npm run dev -- --debug
```

### Check Bundle Size
```bash
npm run build
npx vite-bundle-visualizer
```

### Analyze Dependencies
```bash
npm list
```

### Check for Security Vulnerabilities
```bash
npm audit
```

### Fix Security Issues
```bash
npm audit fix
```

## 🧪 Testing Commands (Future)

### Run Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

## 📱 Mobile Development

### Expose Dev Server to Network
```bash
npm run dev -- --host
```
Access from mobile device using your computer's IP address

### Check Mobile Compatibility
```bash
npm run build
npx serve dist -l 3000
```

## 🚀 Deployment Commands

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

### Build for GitHub Pages
```bash
npm run build
# Then push dist/ folder to gh-pages branch
```

## 🔍 Useful Shortcuts

### Open in Browser
- Dev server: `http://localhost:3000`
- Preview: `http://localhost:4173`

### Keyboard Shortcuts (in browser)
- `Ctrl/Cmd + Shift + R` - Hard refresh
- `F12` - Open DevTools
- `Ctrl/Cmd + K` - Clear console

### VS Code Shortcuts
- `Ctrl/Cmd + P` - Quick file open
- `Ctrl/Cmd + Shift + F` - Search in files
- `Ctrl/Cmd + B` - Toggle sidebar
- `Ctrl/Cmd + J` - Toggle terminal

## 📊 Performance Analysis

### Lighthouse Audit
```bash
npm run build
npx serve dist
# Then run Lighthouse in Chrome DevTools
```

### Bundle Analysis
```bash
npm run build
npx vite-bundle-visualizer
```

## 🔐 Environment Variables

### Create .env file
```bash
echo "VITE_GEMINI_API_KEY=your_key" > .env
```

### Load Environment Variables
```bash
# Automatically loaded by Vite
# Access in code: import.meta.env.VITE_GEMINI_API_KEY
```

## 🎨 Code Formatting (Optional)

### Install Prettier
```bash
npm install -D prettier
```

### Format All Files
```bash
npx prettier --write .
```

### Format Specific Files
```bash
npx prettier --write "src/**/*.{js,jsx,css}"
```

## 📝 Git Commands (Reference)

### Initialize Git
```bash
git init
```

### Add All Files
```bash
git add .
```

### Commit Changes
```bash
git commit -m "Your message"
```

### Push to Remote
```bash
git push origin main
```

### Create New Branch
```bash
git checkout -b feature-name
```

## 🆘 Troubleshooting Commands

### Clear Vite Cache
```bash
rm -rf node_modules/.vite
```

### Reset Everything
```bash
rm -rf node_modules package-lock.json dist .vite
npm install
npm run dev
```

### Check for Port Conflicts
```bash
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000
```

### Kill Process on Port
```bash
# Windows
npx kill-port 3000

# Mac/Linux
kill -9 $(lsof -t -i:3000)
```

## 📚 Documentation Commands

### Generate Component Docs (with Storybook)
```bash
npx storybook init
npm run storybook
```

### Generate JSDoc
```bash
npx jsdoc src -r -d docs
```

## 🎯 Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm install` | Install dependencies |
| `npm run lint` | Check code quality |
| `npx kill-port 3000` | Free up port 3000 |

## 💡 Pro Tips

1. **Use `npm ci` in CI/CD** - Faster, more reliable than `npm install`
2. **Check package.json** - All scripts are defined there
3. **Use `--` to pass flags** - Example: `npm run dev -- --port 8080`
4. **Install globally with `-g`** - For CLI tools you use often
5. **Use `npx`** - Run packages without installing globally

---

**Need Help?** Run `npm run` to see all available scripts.

**More Info?** Check `package.json` for script definitions.
