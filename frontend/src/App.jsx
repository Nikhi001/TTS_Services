import React, { useState, useEffect } from 'react';
import TextInput from './components/TextInput';
import VoiceOptions from './components/VoiceOptions';
import AudioResult from './components/AudioResult';
import './App.css';

// Base URL for API calls. If relative, Vite dev proxy routes to backend.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export default function App() {
  const [text, setText] = useState('Hello! OmniVoice text to speech is running on FastAPI and React.');
  const [mode, setMode] = useState('auto');
  const [instruct, setInstruct] = useState('female, normal pitch, american accent');
  const [speed, setSpeed] = useState(1.0);
  const [numStep, setNumStep] = useState(16);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const [apiHealth, setApiHealth] = useState({ status: 'checking', message: 'Checking API...' });
  const [modelStatus, setModelStatus] = useState({ status: 'unloaded', device: 'cpu' });

  // Check health and model status
  const checkStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (res.ok) {
        setApiHealth({ status: 'healthy', message: 'API Online' });
      } else {
        setApiHealth({ status: 'error', message: 'API Offline' });
      }
    } catch (e) {
      setApiHealth({ status: 'error', message: 'API Disconnected' });
    }

    try {
      const mRes = await fetch(`${API_BASE_URL}/health/model`);
      if (mRes.ok) {
        const mData = await mRes.json();
        setModelStatus(mData);
      }
    } catch (e) {
      // Model endpoint may be unreachable if backend is offline
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle Speech Generation Request
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please enter text to synthesize.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      text: text.trim(),
      mode: mode,
      instruct: mode === 'design' ? instruct : null,
      speed: speed,
      num_step: numStep
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to synthesize speech');
      }

      setResult(data);
      checkStatus(); // Update model status if it changed
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during synthesis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Top Header & Live Status */}
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="brand-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          </div>
          <div>
            <h1 className="brand-title">OmniVoice Studio</h1>
            <p className="brand-subtitle">Massively Multilingual Zero-Shot TTS with Diffusion Architecture</p>
          </div>
        </div>

        <div className="system-badges">
          <span className={`status-badge ${apiHealth.status}`} id="api-status-badge">
            <span className="status-indicator-dot" />
            {apiHealth.message}
          </span>
          <span className="device-badge" id="device-info-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
              <rect x="9" y="9" width="6" height="6"></rect>
              <line x1="9" y1="1" x2="9" y2="4"></line>
              <line x1="15" y1="1" x2="15" y2="4"></line>
              <line x1="9" y1="20" x2="9" y2="23"></line>
              <line x1="15" y1="20" x2="15" y2="23"></line>
              <line x1="20" y1="9" x2="23" y2="9"></line>
              <line x1="20" y1="14" x2="23" y2="14"></line>
              <line x1="1" y1="9" x2="4" y2="9"></line>
              <line x1="1" y1="14" x2="4" y2="14"></line>
            </svg>
            CPU (FP32)
          </span>
        </div>
      </header>

      {/* Main Grid: Control Panel + Result Panel */}
      <main className="app-grid">
        {/* Left Side: Speech Generation Controls */}
        <section className="glass-card">
          <form onSubmit={handleGenerate}>
            <TextInput
              text={text}
              setText={setText}
              maxLength={500}
              disabled={loading}
            />

            <VoiceOptions
              mode={mode}
              setMode={setMode}
              instruct={instruct}
              setInstruct={setInstruct}
              speed={speed}
              setSpeed={setSpeed}
              numStep={numStep}
              setNumStep={setNumStep}
              disabled={loading}
            />

            <button
              id="generate-speech-btn"
              type="submit"
              className="generate-btn"
              disabled={loading || !text.trim()}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Synthesizing Audio...</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  <span>Generate Speech</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Right Side: Audio Result & Playback */}
        <section>
          <AudioResult
            result={result}
            loading={loading}
            error={error}
            apiBaseUrl={API_BASE_URL}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>OmniVoice Web App • Powered by FastAPI & React • Model by k2-fsa</p>
      </footer>
    </div>
  );
}
