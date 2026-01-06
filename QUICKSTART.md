# Quick Start Guide - Voice-First Spiritual Intent Classifier

## 🚀 Get Running in 5 Minutes

### Step 1: Get API Keys

**Deepgram (Speech-to-Text)**
- Go to https://console.deepgram.com/signup
- Create account → Dashboard → API Keys
- Copy your key

**OpenAI (Classification + Response)**
- Go to https://platform.openai.com/signup
- Create account → API Keys → Create new secret key
- Copy your key (ensure GPT-4 access)

**ElevenLabs (Text-to-Speech)**
- Go to https://elevenlabs.io/sign-up
- Create account → API Key
- Copy your key

### Step 2: Configure Environment

```bash
cd backend
# The .env.example file is already created
# Edit .env with your API keys:
#   DEEPGRAM_API_KEY=your_key_here
#   OPENAI_API_KEY=your_key_here
#   ELEVENLABS_API_KEY=your_key_here
```

### Step 3: Start the Backend

```bash
cd backend
npm start
# Should see: 🚀 Server running on http://localhost:5000
```

### Step 4: Start the Frontend (New Terminal)

```bash
cd frontend
npm start
# Should open browser at http://localhost:3000
```

### Step 5: Test!

1. Click 🎤 **Start Recording**
2. Ask a question: *"I'm confused about my career path"*
3. Click ⏹️ **Stop Recording**
4. Wait for response (1-3 seconds)
5. Listen to Krishna's wisdom!

## 🧪 Test Cases to Try

```
1. Career: "I got a job offer but my family wants me to stay in my hometown"
2. Relationships: "Mera boyfriend mujhe propose karna chahta hai"
3. Inner Conflict: "I don't know who I am or what I want from life"
4. Life Transition: "I'm moving to a new city and feeling scared"
5. Daily Struggles: "I have so much anxiety about the future"
```

## 🛠️ Troubleshooting

### Microphone Not Working
```
- Check browser permissions (top-left address bar)
- Allow microphone access when prompted
- Try incognito window if blocked
```

### "Cannot find module" Error
```bash
# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd frontend && rm -rf node_modules && npm install
```

### API Key Error
```
- Double-check keys are copied correctly
- No extra spaces before/after
- .env file is in the backend folder
- Backend is restarted after .env change
```

### Slow Response
```
- Check internet connection
- Verify API keys have quota remaining
- Consider using GPT-3.5-turbo instead (edit llm.js)
```

## 📊 Architecture in 30 Seconds

```
User speaks → Browser records → Sends to Backend → Deepgram STT
→ OpenAI Classification → OpenAI LLM → ElevenLabs TTS → Audio plays
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `backend/server.js` | Main server & routes |
| `backend/services/stt.js` | Speech-to-text |
| `backend/services/classifier.js` | Intent classification |
| `backend/services/llm.js` | Response generation |
| `backend/services/tts.js` | Text-to-speech |
| `frontend/src/App.js` | Main React app |
| `frontend/src/App.css` | Styling |

## 🎯 What's Happening Under the Hood

1. **Recording**: Web Audio API captures user's voice
2. **STT**: Deepgram converts audio → text
3. **Classification**: OpenAI GPT-4 identifies intent category
4. **Response**: OpenAI GPT-4 generates Krishna-like reply
5. **TTS**: ElevenLabs converts response → audio
6. **Playback**: Browser plays synthesized audio

## ⚡ Performance Notes

- First response: 3-5 seconds (model loading)
- Subsequent: 1.5-3 seconds
- Bottleneck: OpenAI API latency
- Optimization: Stream responses for faster first word

## 🎓 Next Steps

1. Test all 5 intent categories
2. Record your screen demo (5 minutes)
3. Export code as GitHub repo
4. Document any improvements you made
5. Submit to PsyTech!

Good luck! 🙏
