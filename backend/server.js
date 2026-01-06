import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { classifyIntent } from './services/classifier.js';
import { transcribeAudio } from './services/stt.js';
import { generateResponse } from './services/llm.js';
import { synthesizeSpeech } from './services/tts.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main endpoint: Process voice input end-to-end
app.post('/api/process-voice', upload.single('audio'), async (req, res) => {
  const startTime = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Get language from form data (multipart field), query params, or body
    // When FormData is used with files, text fields go to req.body
    const language = (req.body && req.body.language) || req.query?.language || 'en';
    console.log('[PROCESS-VOICE] Received language:', language);
    console.log('[PROCESS-VOICE] req.body keys:', Object.keys(req.body || {}));
    console.log('[PROCESS-VOICE] Starting voice processing...');
    const timings = {
      total: 0,
      stt: 0,
      classification: 0,
      llm: 0,
      tts: 0
    };

    // Step 1: Speech-to-Text
    console.log('[STT] Starting transcription...');
    console.log('[STT] Audio buffer size:', req.file.buffer.length, 'bytes');
    const sttStart = Date.now();
    const transcription = await transcribeAudio(req.file.buffer, language);
    timings.stt = Date.now() - sttStart;
    console.log(`[STT] Transcribed: "${transcription.text}" (${timings.stt}ms)`);
    console.log(`[STT] Confidence: ${transcription.confidence}`);

    if (!transcription.text || transcription.text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Could not transcribe audio. Please speak clearly and try again. Make sure your microphone is working.' 
      });
    }

    // Step 2: Intent Classification
    console.log('[CLASSIFY] Classifying intent...');
    const classifyStart = Date.now();
    const intent = await classifyIntent(transcription.text);
    timings.classification = Date.now() - classifyStart;
    console.log(`[CLASSIFY] Intent: ${intent.category} (${timings.classification}ms)`);

    // Step 3: Generate Krishna-like response
    console.log('[LLM] Generating response...');
    const llmStart = Date.now();
    const response = await generateResponse(transcription.text, intent, language);
    timings.llm = Date.now() - llmStart;
    console.log(`[LLM] Response generated (${timings.llm}ms)`);

    // Step 4: Text-to-Speech
    console.log('[TTS] Synthesizing speech...');
    const ttsStart = Date.now();
    const audioBuffer = await synthesizeSpeech(response.text);
    timings.tts = Date.now() - ttsStart;
    console.log(`[TTS] Audio synthesized (${timings.tts}ms)`);

    timings.total = Date.now() - startTime;
    console.log(`[TOTAL] End-to-end latency: ${timings.total}ms`);

    // Return response
    res.json({
      success: true,
      transcription: transcription.text,
      intent: intent,
      response: response.text,
      audio: audioBuffer.toString('base64'),
      timings: timings
    });
  } catch (error) {
    console.error('[ERROR]', error.message);
    res.status(500).json({
      error: error.message,
      details: error.toString()
    });
  }
});

// Endpoint: Just transcribe (for debugging)
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }
    const transcription = await transcribeAudio(req.file.buffer);
    res.json(transcription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Classify text intent
app.post('/api/classify', express.json(), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }
    const intent = await classifyIntent(text);
    res.json(intent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Generate response
app.post('/api/generate-response', express.json(), async (req, res) => {
  try {
    const { text, intent } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }
    const response = await generateResponse(text, intent);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📝 API Endpoints:');
  console.log('  POST /api/process-voice - Full voice processing pipeline');
  console.log('  POST /api/transcribe - Speech-to-text only');
  console.log('  POST /api/classify - Intent classification only');
  console.log('  POST /api/generate-response - Generate response');
});
