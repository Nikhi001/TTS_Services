import React, { useRef, useEffect } from 'react';

export default function AudioResult({ result, loading, error, apiBaseUrl }) {
  const audioRef = useRef(null);

  // Auto-play or reload audio when result changes
  useEffect(() => {
    if (result && result.audio_url && audioRef.current) {
      audioRef.current.load();
    }
  }, [result]);

  const fullAudioUrl = result?.audio_url 
    ? (result.audio_url.startsWith('http') ? result.audio_url : `${apiBaseUrl}${result.audio_url}`)
    : null;

  return (
    <div className="glass-card result-card" id="audio-result-section">
      <div className="card-header">
        <span className="card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
          Audio Output
        </span>
        {result && (
          <span className="status-badge healthy" id="result-status-badge">
            Ready
          </span>
        )}
      </div>

      {error && (
        <div className="error-banner" id="tts-error-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div>
            <strong>Generation Failed</strong>
            <p style={{ marginTop: '0.2rem', fontSize: '0.82rem' }}>{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="result-placeholder" id="result-loading-state">
          <div className="generating-wave">
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            OmniVoice neural model is synthesizing speech on CPU...
          </p>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            (CPU inference takes ~5–15 seconds depending on text length)
          </span>
        </div>
      ) : result && fullAudioUrl ? (
        <div className="player-wrapper" id="audio-player-container">
          <audio
            id="tts-audio-player"
            ref={audioRef}
            controls
            className="audio-controls"
            src={fullAudioUrl}
          >
            Your browser does not support audio playback.
          </audio>

          <div className="meta-grid">
            <div className="meta-item">
              <div className="meta-label">Duration</div>
              <div className="meta-value" id="meta-duration">{result.duration}s</div>
            </div>
            <div className="meta-item">
              <div className="meta-label">Inference Time</div>
              <div className="meta-value" id="meta-infer-time">{result.inference_time_sec}s</div>
            </div>
            <div className="meta-item">
              <div className="meta-label">Device</div>
              <div className="meta-value" id="meta-device">{result.device?.toUpperCase() || 'CPU'}</div>
            </div>
            <div className="meta-item">
              <div className="meta-label">Sample Rate</div>
              <div className="meta-value">24.0 kHz</div>
            </div>
          </div>

          <a
            id="download-wav-btn"
            href={fullAudioUrl}
            download={result.filename || "generated_speech.wav"}
            className="download-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download WAV Audio
          </a>
        </div>
      ) : (
        <div className="result-placeholder" id="result-empty-state">
          <div className="placeholder-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>No Speech Generated Yet</p>
            <p style={{ fontSize: '0.82rem', marginTop: '0.2rem' }}>
              Enter text on the left and click <strong>Generate Speech</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
