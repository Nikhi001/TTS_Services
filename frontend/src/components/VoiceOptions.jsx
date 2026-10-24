import React from 'react';

const DESIGN_PRESETS = [
  { label: "Female • American", instruct: "female, normal pitch, american accent" },
  { label: "Male • British Deep", instruct: "male, low pitch, british accent" },
  { label: "Whisper • Soft", instruct: "female, whisper, soft pitch" },
  { label: "Elderly • Storyteller", instruct: "male, elderly, slow, deep pitch" }
];

export default function VoiceOptions({
  mode,
  setMode,
  instruct,
  setInstruct,
  speed,
  setSpeed,
  numStep,
  setNumStep,
  disabled = false
}) {
  return (
    <div className="options-section">
      <div className="card-header">
        <span className="card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
          Voice & Inference Options
        </span>
      </div>

      {/* Mode toggle */}
      <div className="mode-toggle-group">
        <button
          type="button"
          id="mode-auto-btn"
          className={`mode-toggle-btn ${mode === 'auto' ? 'active' : ''}`}
          onClick={() => setMode('auto')}
          disabled={disabled}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
          </svg>
          Auto Voice
        </button>

        <button
          type="button"
          id="mode-design-btn"
          className={`mode-toggle-btn ${mode === 'design' ? 'active' : ''}`}
          onClick={() => setMode('design')}
          disabled={disabled}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          Voice Design
        </button>
      </div>

      {/* Voice Design instructions input */}
      {mode === 'design' && (
        <div className="voice-design-box">
          <label htmlFor="instruct-input" className="slider-label">
            <span>Speaker Attributes (comma-separated):</span>
          </label>
          <input
            id="instruct-input"
            type="text"
            className="instruct-input"
            placeholder="e.g. female, low pitch, american accent"
            value={instruct}
            disabled={disabled}
            onChange={(e) => setInstruct(e.target.value)}
          />
          <div className="preset-pills">
            {DESIGN_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                id={`design-preset-${idx}`}
                className="preset-pill"
                disabled={disabled}
                onClick={() => setInstruct(p.instruct)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Speed & Diffusion steps sliders */}
      <div className="sliders-row">
        <div className="slider-group">
          <div className="slider-label">
            <span>Speech Speed:</span>
            <strong id="speed-display">{speed.toFixed(1)}x</strong>
          </div>
          <input
            id="speed-range"
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={speed}
            disabled={disabled}
            className="custom-range"
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
          />
        </div>

        <div className="slider-group">
          <div className="slider-label">
            <span>Diffusion Steps:</span>
            <strong id="num-step-display">{numStep} ({numStep === 16 ? 'Fast CPU' : 'High Quality'})</strong>
          </div>
          <input
            id="num-step-range"
            type="range"
            min="16"
            max="32"
            step="16"
            value={numStep}
            disabled={disabled}
            className="custom-range"
            onChange={(e) => setNumStep(parseInt(e.target.value, 10))}
          />
        </div>
      </div>
    </div>
  );
}
