import axios from 'axios';

/**
 * Transcribe audio using Deepgram API
 * Supports: English, Hindi, Hinglish
 * @param {Buffer} audioBuffer - The audio data
 * @param {string} language - Language code: 'en' (English), 'hi' (Hindi), 'en-IN' (Hinglish)
 */
export async function transcribeAudio(audioBuffer, language = 'en') {
  const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

  if (!DEEPGRAM_API_KEY) {
    throw new Error('DEEPGRAM_API_KEY not configured');
  }

  try {
    console.log(`[STT] Audio buffer size: ${audioBuffer.length} bytes`);
    console.log(`[STT] Language requested: ${language}`);
    
    // Map user language to Deepgram language codes
    // Deepgram nova-2 supports: en, hi, and can handle Hinglish (code-mixing)
    let deepgramLanguage = language;
    let deepgramModel = 'nova-2'; // Most accurate model
    
    if (language === 'hi') {
      deepgramLanguage = 'hi'; // Hindi
      console.log(`[STT] Using Hindi model`);
    } else if (language === 'hinglish') {
      // For Hinglish (code-mixing), use hi language and let Deepgram auto-detect English words
      deepgramLanguage = 'hi'; // Start with Hindi base
      console.log(`[STT] Using Hindi + English auto-mix mode for Hinglish`);
    } else {
      deepgramLanguage = 'en'; // Default to English
      console.log(`[STT] Using English model`);
    }
    
    console.log(`[STT] Deepgram language: ${deepgramLanguage}, model: ${deepgramModel}`);
    
    // Deepgram nova-2 with language setting
    const response = await axios.post(
      `https://api.deepgram.com/v1/listen?language=${deepgramLanguage}&model=${deepgramModel}`,
      audioBuffer,
      {
        headers: {
          'Authorization': `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': 'audio/webm'
        },
        timeout: 30000
      }
    );

    console.log('[STT] Deepgram response received');

    // Correct path for Deepgram API response
    const transcript = response.data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
    const confidence = response.data.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;

    return {
      text: transcript,
      confidence: confidence,
      language: language === 'en' ? 'English' : language === 'hi' ? 'Hindi' : 'English'
    };
  } catch (error) {
    console.error('STT Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data
    });
    throw new Error(`Transcription failed: ${error.response?.data?.message || error.message}`);
  }
}
