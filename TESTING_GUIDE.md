# Testing Guide - Voice-First Spiritual Intent Classifier

## Pre-Testing Checklist

- [ ] All dependencies installed (`npm install` in both folders)
- [ ] API keys obtained (Deepgram, OpenAI, ElevenLabs)
- [ ] `.env` file configured with API keys
- [ ] Backend running on `http://localhost:5000`
- [ ] Frontend running on `http://localhost:3000`
- [ ] Microphone permissions granted to browser

## Quick Test (5 Minutes)

### 1. Health Check
```bash
# In terminal, test backend is running
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","timestamp":"2026-01-05T..."}
```

### 2. Simple Recording Test
1. Open http://localhost:3000 in browser
2. Click **🎤 Start Recording**
3. Say clearly: *"I am confused about my career"*
4. Click **⏹️ Stop Recording**
5. Wait 2-3 seconds
6. Should see:
   - ✅ Transcription: "I am confused about my career"
   - ✅ Intent: "Career/Purpose" (high confidence)
   - ✅ Response: Krishna wisdom about career
   - ✅ Latency metrics shown
   - ✅ Audio plays automatically

## Full Test Suite (30 Minutes)

Test all 5 intent categories + edge cases:

### Category 1: Career/Purpose
**Test Case 1.1** - Basic career question
```
Input: "I got a promotion but I feel unfulfilled"
Expected:
  - Category: Career/Purpose
  - Confidence: >0.90
  - Response mentions: duty, purpose, meaningful work
  - Latency: <3 seconds
```

**Test Case 1.2** - Hinglish career
```
Input: "Mujhe naukri mein promotion mila but I'm confused"
Expected:
  - Category: Career/Purpose
  - Handles mixed Hindi/English
  - Response relevant to career
```

### Category 2: Relationships
**Test Case 2.1** - Family relationships
```
Input: "My parents want me to get married but I'm not ready"
Expected:
  - Category: Relationships
  - Confidence: >0.85
  - Response: Balances family duty + personal choice
```

**Test Case 2.2** - Hinglish relationship
```
Input: "Mera boyfriend mujhe propose karna chahta hai"
Expected:
  - Category: Relationships
  - Proper Hinglish understanding
  - Response about relationships/commitment
```

### Category 3: Inner Conflict
**Test Case 3.1** - Identity struggle
```
Input: "I don't know who I am or what I want from life"
Expected:
  - Category: Inner Conflict
  - Confidence: >0.85
  - Response: Spiritual guidance on self-discovery
```

**Test Case 3.2** - Values conflict
```
Input: "I want to pursue art but my family wants me to be an engineer"
Expected:
  - Category: Inner Conflict OR Life Transitions
  - Response addresses conflicting desires
```

### Category 4: Life Transitions
**Test Case 4.1** - Major life change
```
Input: "I'm moving to a different country for work"
Expected:
  - Category: Life Transitions
  - Confidence: >0.85
  - Response: Acceptance, adaptation, growth
```

**Test Case 4.2** - Marriage transition
```
Input: "I just got married and everything has changed"
Expected:
  - Category: Life Transitions
  - Response acknowledges major milestone
```

### Category 5: Daily Struggles
**Test Case 5.1** - Stress/anxiety
```
Input: "I'm so stressed about my exams next week"
Expected:
  - Category: Daily Struggles
  - Confidence: >0.90
  - Response: Practical coping, mindfulness
```

**Test Case 5.2** - General overwhelm
```
Input: "I feel so overwhelmed with everything"
Expected:
  - Category: Daily Struggles
  - Response: Acceptance, one-step-at-a-time
```

## Edge Cases

### Edge Case 1: Unclear Input
```
Input: "xyz abc dfgh lkjh"
Expected:
  - Should NOT crash
  - Either: Low confidence classification OR error message
  - Graceful fallback
```

### Edge Case 2: Background Noise
```
Setup: Run test with background noise (fan, traffic)
Input: Normal question spoken with background noise
Expected:
  - Still transcribes reasonably
  - Deepgram handles noise well
  - Response shows confidence score
```

### Edge Case 3: Overlapping Speech
```
Setup: Someone talks while user is answering
Input: "I'm confused about... [interruption]... my life"
Expected:
  - Should handle gracefully
  - May have lower confidence
  - But still attempts classification
```

### Edge Case 4: Very Long Input
```
Input: 5-minute long rambling answer
Expected:
  - Still transcribes all
  - Classification focuses on main theme
  - Response is still concise 2-3 sentences
```

### Edge Case 5: Silence Detection
```
Input: Record silence for 5 seconds
Expected:
  - Either: Error message or empty transcription
  - Graceful handling (no hanging)
```

### Edge Case 6: Non-English Input
```
Input: Pure Hindi or Marathi (outside Hinglish)
Expected:
  - May have lower accuracy
  - Should still attempt transcription
  - Classification may struggle
```

## Performance Testing

### Latency Measurement
After each test, verify **timings** in response:

```json
"timings": {
  "stt": 250,           // Should be: 200-500ms
  "classification": 150, // Should be: 100-300ms
  "llm": 600,           // Should be: 400-800ms
  "tts": 450,           // Should be: 300-600ms
  "total": 1450         // Should be: 1500-3000ms
}
```

### Expected Performance
- **First request**: 3-5 seconds (model loading)
- **Subsequent**: 1.5-3 seconds
- **Acceptable**: All under 5 seconds
- **Good**: Most under 3 seconds

### Performance Optimization Tips
If latency is high:
1. Check internet connection (run `ping deepgram.com`)
2. Verify OpenAI API quota
3. Check backend CPU usage
4. Consider using GPT-3.5-turbo instead of GPT-4

## Browser Compatibility Testing

Test on different browsers:

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome | ✅ | Best support, Web Audio API |
| Firefox | ✅ | Good support |
| Safari | ⚠️ | Limited Web Audio API |
| Edge | ✅ | Chromium-based, good support |
| Mobile Chrome | ⚠️ | May have permission issues |

## API Endpoint Testing (curl/Postman)

### Test 1: Full Pipeline
```bash
# Record audio → save as test.wav
# Then upload:

curl -X POST http://localhost:5000/api/process-voice \
  -F "audio=@test.wav"

# Expected response: Full JSON with transcription, intent, response, audio, timings
```

### Test 2: Transcription Only
```bash
curl -X POST http://localhost:5000/api/transcribe \
  -F "audio=@test.wav"

# Expected: { "text": "...", "confidence": 0.95, "language": "en-IN" }
```

### Test 3: Classification Only
```bash
curl -X POST http://localhost:5000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "I am confused about my career"}'

# Expected: { "category": "Career/Purpose", "confidence": 0.98, "explanation": "..." }
```

### Test 4: Generate Response
```bash
curl -X POST http://localhost:5000/api/generate-response \
  -H "Content-Type: application/json" \
  -d '{"text": "I am confused about my career", "intent": {"category": "Career/Purpose"}}'

# Expected: { "text": "Dear one, your dharma...", "intent": "Career/Purpose", "tokens_used": 125 }
```

## Debugging Checklist

### Frontend Issues
- [ ] Check browser console (F12) for errors
- [ ] Check Network tab for failed requests
- [ ] Verify backend URL is correct
- [ ] Check microphone permissions
- [ ] Clear browser cache and reload

### Backend Issues
- [ ] Check terminal for error logs
- [ ] Verify `.env` file exists with keys
- [ ] Test health endpoint: `curl http://localhost:5000/health`
- [ ] Check Node.js version (need 16+)
- [ ] Restart backend with `npm start`

### API Key Issues
- [ ] Test Deepgram: Go to https://console.deepgram.com, verify key
- [ ] Test OpenAI: `curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models`
- [ ] Test ElevenLabs: `curl -H "xi-api-key: $ELEVENLABS_API_KEY" https://api.elevenlabs.io/v1/voices`

### Audio Issues
- [ ] Check microphone levels (use system audio settings)
- [ ] Test microphone in other apps first
- [ ] Try different browser
- [ ] Check if browser is muted
- [ ] Verify speaker/headphones work

## Test Report Template

Use this to document your testing:

```markdown
# Test Report - [Date]

## Setup
- Backend: ✅ Running on localhost:5000
- Frontend: ✅ Running on localhost:3000
- API Keys: ✅ All configured

## Category Tests

### Career/Purpose
- Input: "I'm confused about my career"
- Output: Category correctly identified
- Latency: 2.3s
- Status: ✅ PASS / ❌ FAIL

### Relationships
- Input: "My parents want me to marry"
- Output: Category correctly identified
- Latency: 2.1s
- Status: ✅ PASS / ❌ FAIL

[Continue for all 5 categories + edge cases]

## Performance Summary
- Average latency: 2.2s
- Slowest response: 3.5s
- Fastest response: 1.8s
- Success rate: 100%

## Issues Found
- [List any problems]

## Recommendations
- [List improvements needed]
```

## After Testing

✅ All tests passed → Ready for demo recording
❌ Some tests failed → Debug and retest

---

**Total Testing Time**: 30-60 minutes
**Expected Success Rate**: >95%

Good luck with testing! 🎯
