import React from 'react';

const PRESET_PROMPTS = [
  {
    label: "English Intro",
    text: "Hello, welcome to OmniVoice. This text-to-speech engine runs real neural inference on CPU."
  },
  {
    label: "Multilingual Demo",
    text: "OmniVoice supports over six hundred languages with high acoustic fidelity and zero-shot synthesis."
  },
  {
    label: "Expressive Reading",
    text: "The sun dipped below the horizon, casting an amber glow across the quiet, whispering valley."
  }
];

export default function TextInput({ text, setText, maxLength = 500, disabled = false }) {
  const charCount = text.length;
  const isNearLimit = charCount > maxLength * 0.85;
  const isAtLimit = charCount >= maxLength;

  return (
    <div className="input-section">
      <div className="card-header">
        <label htmlFor="tts-text-input" className="card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Input Text
        </label>
        <span className={`char-counter ${isAtLimit ? 'danger' : isNearLimit ? 'warning' : ''}`} id="char-count-display">
          {charCount} / {maxLength}
        </span>
      </div>

      <textarea
        id="tts-text-input"
        className="tts-textarea"
        placeholder="Type or paste the text you want the model to speak..."
        value={text}
        maxLength={maxLength}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        rows={4}
      />

      <div className="input-footer">
        <span>Try sample prompts:</span>
        <div className="preset-pills">
          {PRESET_PROMPTS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              id={`preset-prompt-${idx}`}
              className="preset-pill"
              disabled={disabled}
              onClick={() => setText(preset.text)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
