# AI Setup Instructions for MindFlow v1.0.2

## Overview
Version 1.0.2 now includes **real AI integration** using OpenRouter API with Claude 3.5 Sonnet. The AI provides intelligent, context-aware responses based on your mood, energy, sleep data, and tasks.

## Features
- Context-aware conversations using your journal entries
- Personalized mood analysis and recommendations
- Smart suggestions based on your patterns
- Fallback to keyword-based responses if API is unavailable

## Setup (5 minutes)

### Step 1: Get Your Free API Key
1. Visit https://openrouter.ai/keys
2. Sign up for a free account (you can use Google/GitHub)
3. Create a new API key
4. Copy the key (starts with `sk-or-v1-...`)

### Step 2: Configure the App
1. In the project root, create a file named `.env`
2. Add this line (replace with your actual key):
   ```
   VITE_OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
   ```
3. Save the file

### Step 3: Restart the Dev Server
```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

### Step 4: Test It Out
1. Open the app and go to the AI tab
2. Ask something like "Как дела?" or "Дай совет по продуктивности"
3. You should get intelligent responses from Claude!

## Important Notes

### Free Tier Limits
- OpenRouter offers a generous free tier
- Claude 3.5 Sonnet costs about $0.003 per 1K tokens
- You get $5 in free credits to start
- This is enough for thousands of conversations

### Fallback Mode
If the API key is not set or runs out of credits:
- The app automatically falls back to smart keyword-based responses
- Users still get helpful advice, just not AI-powered

### Security
- **Never commit your `.env` file to git**
- The `.env` file is already in `.gitignore`
- Only share the `.env.example` file
- Each developer needs their own API key

## Alternative: Other AI Providers

You can modify `src/services/chatService.js` to use other providers:

### OpenAI (ChatGPT)
```javascript
// Change the fetch URL to:
'https://api.openai.com/v1/chat/completions'

// Use model:
'gpt-3.5-turbo' // or 'gpt-4'
```

### Anthropic Direct
```javascript
// Change the fetch URL to:
'https://api.anthropic.com/v1/messages'

// Use different headers and format
```

## Troubleshooting

### "AI is not responding"
- Check that `.env` file exists in project root
- Verify the API key starts with `sk-or-v1-`
- Restart the dev server after adding the key
- Check browser console for error messages

### "403 Forbidden" errors
- Your API key might be invalid
- Generate a new key at https://openrouter.ai/keys

### "Rate limit exceeded"
- You've used up your free credits
- Add credits to your OpenRouter account
- Or the app will automatically use fallback responses

## Cost Estimation

**For typical usage:**
- Average conversation: ~500 tokens = $0.0015
- 100 conversations per day = $0.15/day
- Monthly cost: ~$4.50

**Free tier covers:**
- About 3,000+ conversations before needing to add credits

## Questions?
If you need help setting up AI, reach out to Roman Makarov.
