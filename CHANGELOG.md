# Changelog

## Version 1.0.2 (2025-01-19)

### ✅ Fixed
- **Schedule saving bug**: Fixed day-of-week conversion bug that prevented schedule items from saving properly. Sunday (0) is now correctly converted to 7 to match the 1-7 day system used in the form.
- **Schedule display**: Now shows all schedule items grouped by day of the week, not just today's items. Each day's lessons are sorted by start time.

### ✨ New Features
- **Real AI Integration**: Integrated OpenRouter API with Claude 3.5 Sonnet for intelligent AI responses
  - Supports context-aware conversations based on user's mood, energy, sleep data
  - Falls back to smart keyword-based responses if API key is not configured
  - To enable: Get free API key from https://openrouter.ai/keys and add to `.env` file

### 🎨 UI Improvements
- **Navigation redesign**: Enhanced bottom navigation with improved animations, active indicators, and smoother transitions
  - Added active indicator dot below selected tab
  - Improved icon animations (slight upward movement on active state)
  - Enhanced frosted glass effect with better gradient overlays
  - Smoother spring animations for tab switching

### 📦 Deployment
- Build completed successfully ✅
- **Netlify issue**: Account credit usage exceeded - deploys blocked until credits added
  - Alternative: Deploy to Vercel, Render, or GitHub Pages
  - Or upgrade Netlify account to continue using it

### 📝 Setup Instructions

#### AI Setup (Optional but Recommended)
1. Visit https://openrouter.ai/keys to get a free API key
2. Create `.env` file in project root (use `.env.example` as template)
3. Add your API key: `VITE_OPENROUTER_API_KEY=your_api_key_here`
4. Restart dev server

#### Deploy to Alternative Platforms

**Option 1: Vercel (Recommended)**
```bash
npm install -g vercel
vercel --prod
```

**Option 2: Render**
1. Connect GitHub repository to Render
2. Set build command: `npm run build`
3. Set publish directory: `dist`

**Option 3: GitHub Pages**
```bash
npm run build
# Push dist folder to gh-pages branch
```

### 🔧 Technical Changes
- Updated `package.json` version to 1.0.2
- Updated Settings page to show version 1.0.2
- Added `.env` and `.env.example` for API key configuration
- Added `.env` to `.gitignore`
- Improved ScheduleManager component with better day handling
- Enhanced Navigation component with new animations
- Updated chatService with OpenRouter API integration
