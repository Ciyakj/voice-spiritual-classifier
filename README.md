# Voice-First Spiritual Intent Classifier

A voice-first app that listens to questions and responds with spiritual guidance, classifying intents into 5 categories with multi-language support (English, Hindi, Hinglish).

## Quick Start

### Prerequisites 
- Node.js 16+ 
- npm or yarn
- Microphone access (browser)

### Setup

1. **Clone the repo**
```bash
git clone https://github.com/Ciyakj/voice-spiritual-classifier.git
cd voice-spiritual-classifier
```

2. **Install dependencies**
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

3. **Configure environment variables**
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env` with your API keys:
- `DEEPGRAM_API_KEY` - for speech-to-text
- `GROQ_API_KEY` - for response generation

4. **Start the app**

Terminal 1 (Backend):
```bash
cd backend
npm start
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

App opens at: http://localhost:3000

## Features

✅ **Voice Recording** - Web Audio API for clean recording
✅ **Multi-Language** - English, Hindi, Hinglish support  
✅ **Intent Classification** - 5 categories (Career, Relationships, Inner Conflict, Life Transitions, Daily Struggles)
✅ **Response Generation** - Krishna wisdom via Groq LLM
✅ **Text-to-Speech** - Web Speech API for audio output
✅ **Real-time Latency Tracking** - Performance metrics

## How It Works

1. Click **"Start Recording"** and speak your question
2. App transcribes via Deepgram
3. Intent is classified (5 categories)
4. Response generated via Groq LLM
5. Click **"Play Response"** to hear the answer

## API Endpoints

- `POST /api/process-voice` - Full pipeline (record → transcribe → classify → respond)
- `POST /api/transcribe` - Speech-to-text only
- `POST /api/classify` - Intent classification only
- `POST /api/generate-response` - Generate response text

## Performance

| Stage | Time |
|-------|------|
| Speech-to-Text | 1-2s |
| Intent Classification | <100ms |
| Response Generation | 300-500ms |
| Text-to-Speech | 500-800ms |
| **Total** | **4-8s** |

Note: Latency is primarily driven by external API calls (Deepgram STT). To achieve <1s would require local LLM inference or pre-computed responses.

## Testing

See `TESTING_GUIDE.md` for comprehensive test cases.

## Requirements Verification

See `REQUIREMENTS_VERIFICATION.md` for detailed requirement mapping.

## Tech Stack

- **Frontend**: React 18, Web Audio API, Web Speech API
- **Backend**: Node.js, Express, Groq SDK
- **STT**: Deepgram nova-2
- **LLM**: Groq Mixtral-8x7b
- **TTS**: Web Speech API (browser)

## License

MIT
