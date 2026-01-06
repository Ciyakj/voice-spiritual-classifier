import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Synthesize text to speech using ElevenLabs API
 * Returns audio buffer in WAV format
 */
export async function synthesizeSpeech(text) {
  // Demo mode for testing without ElevenLabs
  if (process.env.DEMO_MODE === 'true') {
    console.log('[TTS] Using demo mode - no audio synthesis');
    // Return silent audio in demo mode
    return generateSilentAudio();
  }

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not configured and DEMO_MODE is off');
  }

  try {
    console.log('[TTS] Calling ElevenLabs API...');
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 30000
      }
    );

    console.log('[TTS] Audio synthesized successfully');
    return Buffer.from(response.data);
  } catch (error) {
    console.error('[TTS] ElevenLabs Error:', error.response?.status, error.response?.data?.message || error.message);
    console.log('[TTS] Falling back to demo audio due to API error...');
    // Fall back to demo audio instead of throwing error
    return generateSilentAudio();
  }
}

/**
 * Generate a simple tone WAV file (for demo mode - audible test audio)
 */
function generateSilentAudio() {
  // WAV header for 2 seconds of tone at 16kHz
  const sampleRate = 16000;
  const duration = 2; // seconds
  const frequency = 440; // Hz (A4 note)
  const numSamples = sampleRate * duration;
  
  const buffer = Buffer.alloc(44 + numSamples * 2);
  
  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24); // sample rate
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);
  
  // Generate simple sine wave tone
  const amplitude = 0.3;
  let offset = 44;
  
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.sin((2 * Math.PI * frequency * i) / sampleRate) * amplitude * 32767;
    buffer.writeInt16LE(Math.round(sample), offset);
    offset += 2;
  }
  
  return buffer;
}
