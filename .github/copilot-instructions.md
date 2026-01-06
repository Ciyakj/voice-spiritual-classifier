# Voice-First Spiritual Intent Classifier - Setup Complete

## Project Overview
A voice-first spiritual companion app using React + Node.js with AI-powered intent classification and Krishna-like responses.

## Tech Stack
- **Frontend**: React 18 with Web Audio API
- **Backend**: Node.js/Express
- **STT**: Deepgram Nova-2
- **LLM**: OpenAI GPT-4
- **TTS**: ElevenLabs

## Status Checklist
- [x] Project structure created
- [x] Backend server scaffolded
- [x] Frontend React app created
- [x] Services (STT, Classification, LLM, TTS) implemented
- [x] Beautiful UI with real-time feedback
- [x] README with complete documentation
- [ ] Dependencies installed
- [ ] API keys configured
- [ ] Testing in progress

## Next Steps
1. Run `npm install:all` in root to install all dependencies
2. Create `.env` file in backend with API keys:
   - DEEPGRAM_API_KEY
   - OPENAI_API_KEY
   - ELEVENLABS_API_KEY
3. Start backend: `npm run dev:backend`
4. Start frontend: `npm run dev:frontend`
5. Test with voice queries
