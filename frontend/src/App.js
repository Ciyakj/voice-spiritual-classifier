import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [intent, setIntent] = useState(null);
  const [response, setResponse] = useState('');
  const [timings, setTimings] = useState(null);
  const [error, setError] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [responseAudio, setResponseAudio] = useState(null);
  const [language, setLanguage] = useState('en'); // Add language selection

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  // Initialize Web Audio API and Speech Synthesis
  useEffect(() => {
    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorder.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };
        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioBlob(blob);
          audioChunksRef.current = [];
        };
        mediaRecorderRef.current = mediaRecorder;
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (err) {
        setError('Microphone access denied. Please enable audio permissions.');
      }
    };
    
    // Initialize speech synthesis
    const initSpeechSynthesis = () => {
      if (window.speechSynthesis) {
        // Load voices
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          console.log('Speech synthesis voices loaded:', voices.length);
        };
        
        // Load voices on page load
        loadVoices();
        
        // Also load when voices change
        window.speechSynthesis.onvoiceschanged = loadVoices;
      } else {
        console.warn('Speech Synthesis API not supported');
      }
    };
    
    setupAudio();
    initSpeechSynthesis();
  }, []);

  const startRecording = () => {
    if (mediaRecorderRef.current) {
      // Stop any currently playing audio
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      }

      audioChunksRef.current = [];
      setError('');
      setTranscription('');
      setResponse('');
      setIntent(null);
      setTimings(null);
      setResponseAudio(null);
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Processing will happen after audio blob is ready (in the onstop callback)
    }
  };

  const processAudio = useCallback(async () => {
    if (!audioBlob) {
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append('language', language); // Add language as form field

      const response = await axios.post(
        `${API_BASE_URL}/process-voice?language=${language}`, // Also add as query param for backup
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      console.log('[FRONTEND] Server response:', response.data);

      if (response.data.success || response.data.transcription) {
        setTranscription(response.data.transcription);
        setIntent(response.data.intent);
        setResponse(response.data.response);
        setTimings(response.data.timings);

        if (response.data.audio) {
          console.log('Audio data received from server, length:', response.data.audio.length);
          // Convert base64 to binary data for browser
          const binaryString = atob(response.data.audio);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const audioUrl = URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }));
          console.log('Audio URL created:', audioUrl);
          setResponseAudio(audioUrl);
          
          // Don't auto-play - let user click play button
          // User can click "Play Response" button to hear it
        } else {
          console.log('No audio data in response');
        }
      } else {
        setError('Unexpected response format from server');
      }
    } catch (err) {
      console.error('[FRONTEND] Error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Processing failed';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [audioBlob, language]);

  // Effect to process audio when audioBlob is ready
  useEffect(() => {
    if (audioBlob && !isRecording) {
      processAudio();
    }
  }, [audioBlob, isRecording, processAudio]);

  const playResponseAudio = () => {
    if (!response) {
      setError('No response available. Try speaking again.');
      return;
    }
    
    if (isPlaying) {
      // Stop currently speaking
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    setError('');
    setIsPlaying(true);
    
    try {
      console.log('=== Speech Synthesis Start ===');
      console.log('Response:', response);
      console.log('Language:', language);
      
      // Check if Speech Synthesis is supported
      if (!window.speechSynthesis) {
        throw new Error('Speech Synthesis not supported in this browser');
      }
      
      // Cancel any existing utterances
      window.speechSynthesis.cancel();
      
      // Small delay to ensure cancel completes
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(response);
        
        // Get voices
        const allVoices = window.speechSynthesis.getVoices();
        console.log('Available voices:', allVoices.length);
        
        if (allVoices.length > 0) {
          console.log('All voices:', allVoices.map(v => v.name + ' (' + v.lang + ')').join(', '));
          
          let selectedVoice = null;
          
          // Select voice based on language
          if (language === 'hi') {
            // Look for Hindi voice
            selectedVoice = allVoices.find(voice => voice.lang.startsWith('hi'));
            console.log('Looking for Hindi voice...');
            if (selectedVoice) {
              console.log('Found Hindi voice:', selectedVoice.name);
            } else {
              console.log('No Hindi voice found, will use default');
              selectedVoice = allVoices[0];
            }
          } else if (language === 'hinglish') {
            // For Hinglish, prefer Hindi voice (since it's mostly Hindi with English words)
            // But fall back to English if Hindi not available
            selectedVoice = allVoices.find(voice => voice.lang.startsWith('hi'));
            console.log('Looking for Hindi voice for Hinglish...');
            if (!selectedVoice) {
              console.log('No Hindi voice found, using English voice for Hinglish');
              selectedVoice = allVoices.find(voice => voice.lang.startsWith('en')) || allVoices[0];
            } else {
              console.log('Found Hindi voice for Hinglish:', selectedVoice.name);
            }
          } else {
            // For English, use English voice
            selectedVoice = allVoices.find(voice => voice.lang.startsWith('en')) || allVoices[0];
            console.log('Using English voice:', selectedVoice.name);
          }
          
          utterance.voice = selectedVoice;
          console.log('Selected voice:', selectedVoice.name, '(' + selectedVoice.lang + ')');
        }
        
        // Set properties
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Set language for utterance
        if (language === 'hi') {
          utterance.lang = 'hi-IN';
        } else if (language === 'hinglish') {
          // Hinglish is code-mixing, try Hindi voice
          utterance.lang = 'hi-IN';
        } else {
          utterance.lang = 'en-US';
        }
        console.log('Utterance language set to:', utterance.lang);
        
        utterance.onstart = () => {
          console.log('✓ onstart - Speech started');
        };
        
        utterance.onend = () => {
          console.log('✓ onend - Speech finished');
          setIsPlaying(false);
        };
        
        utterance.onerror = (event) => {
          console.error('✗ onerror:', event.error);
          setError('Speech error: ' + event.error);
          setIsPlaying(false);
        };
        
        utterance.onpause = () => {
          console.log('⊙ paused');
        };
        
        utterance.onresume = () => {
          console.log('▶ resumed');
        };
        
        console.log('Calling speak()...');
        window.speechSynthesis.speak(utterance);
        console.log('speak() called');
        
      }, 100);
      
    } catch (err) {
      console.error('Exception:', err);
      setError(err.message);
      setIsPlaying(false);
    }
  };
  
  // Test speech synthesis function
  const testSpeech = () => {
    if (!window.speechSynthesis) {
      alert('Speech Synthesis NOT supported!');
      return;
    }
    
    window.speechSynthesis.cancel();
    
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance('Hello! This is a test. Can you hear me?');
      const voices = window.speechSynthesis.getVoices();
      
      if (voices.length > 0) {
        utterance.voice = voices[0];
      }
      
      utterance.volume = 1.0;
      utterance.rate = 1.0;
      
      utterance.onend = () => alert('Test complete');
      utterance.onerror = (e) => alert('Error: ' + e.error);
      
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>🙏 Krishna's Guidance</h1>
        <p className="subtitle">Voice-First Spiritual Intent Classifier</p>
      </div>

      <div className="app-content">
        {/* Recording Section */}
        <div className="section recording-section">
          <h2>Share Your Question</h2>
          <p className="instructions">Speak your question about life, relationships, or career...</p>
          
          {/* Language Selector */}
          <div className="language-selector">
            <label htmlFor="language">🌐 Language:</label>
            <select 
              id="language"
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isRecording || isProcessing}
            >
              <option value="en">🇬🇧 English</option>
              <option value="hi">🇮🇳 Hindi</option>
              <option value="hinglish">🔀 Hinglish (Hindi + English)</option>
            </select>
          </div>
          
          <div className="recording-controls">
            {!isRecording ? (
              <button 
                className="btn btn-record"
                onClick={startRecording}
                disabled={isProcessing}
              >
                🎤 Start Recording
              </button>
            ) : (
              <button 
                className="btn btn-stop"
                onClick={stopRecording}
              >
                ⏹️ Stop Recording
              </button>
            )}
          </div>

          {isProcessing && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Processing your question...</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {(transcription || response) && (
          <div className="section results-section">
            {transcription && (
              <div className="result-block">
                <h3>📝 Your Question</h3>
                <p className="result-text">{transcription}</p>
              </div>
            )}

            {intent && (
              <div className="result-block intent-block">
                <h3>🎯 Intent Classification</h3>
                <div className="intent-info">
                  <span className="intent-label">{intent.category}</span>
                  <span className="confidence">Confidence: {(intent.confidence * 100).toFixed(0)}%</span>
                </div>
                {intent.explanation && (
                  <p className="explanation">{intent.explanation}</p>
                )}
              </div>
            )}

            {response && (
              <div className="result-block response-block">
                <h3>💬 Krishna's Response</h3>
                <p className="response-text">"{response}"</p>
                {responseAudio && (
                  <button 
                    className="btn btn-play" 
                    onClick={playResponseAudio}
                    disabled={isProcessing}
                  >
                    {isPlaying ? '⏸️ Stop Audio' : '🔊 Play Response'}
                  </button>
                )}
              </div>
            )}

            {timings && (
              <div className="result-block timings-block">
                <h3>⚡ Performance Metrics</h3>
                <div className="timing-grid">
                  <div className="timing-item">
                    <span className="timing-label">Speech-to-Text</span>
                    <span className="timing-value">{timings.stt}ms</span>
                  </div>
                  <div className="timing-item">
                    <span className="timing-label">Classification</span>
                    <span className="timing-value">{timings.classification}ms</span>
                  </div>
                  <div className="timing-item">
                    <span className="timing-label">Response Gen</span>
                    <span className="timing-value">{timings.llm}ms</span>
                  </div>
                  <div className="timing-item">
                    <span className="timing-label">Text-to-Speech</span>
                    <span className="timing-value">{timings.tts}ms</span>
                  </div>
                  <div className="timing-item total">
                    <span className="timing-label">Total</span>
                    <span className="timing-value">{timings.total}ms</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="section error-section">
            <h3>⚠️ Error</h3>
            <p className="error-text">{error}</p>
            <button 
              className="btn" 
              style={{backgroundColor: '#ef4444', marginTop: '10px'}}
              onClick={testSpeech}
            >
              🔊 Test Speech (Debug)
            </button>
          </div>
        )}
        
        {/* Debug Test Button */}
        {!error && !isProcessing && !response && (
          <div style={{textAlign: 'center', padding: '20px'}}>
            <button 
              className="btn" 
              style={{backgroundColor: '#999', fontSize: '0.9em'}}
              onClick={testSpeech}
            >
              🔊 Test Voice (Optional)
            </button>
          </div>
        )}
      </div>

      <footer className="app-footer">
        <p>💡 Pro Tip: Speak clearly and wait for the response before asking another question.</p>
      </footer>
    </div>
  );
}

export default App;
