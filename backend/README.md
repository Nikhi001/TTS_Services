# OmniVoice FastAPI Backend

FastAPI service providing real-time text-to-speech inference powered by the official [OmniVoice](https://github.com/k2-fsa/OmniVoice) model on CPU.

## Features

- **Real OmniVoice CPU Inference**: Direct integration with official OmniVoice without mock modes.
- **RESTful Endpoints**:
  - `GET /health`: Liveness probe.
  - `GET /health/model`: Model readiness probe.
  - `POST /api/tts`: Audio synthesis with validation and voice options.
  - `GET /api/audio/{filename}`: Safe WAV file retrieval with path traversal protection.
- **Pydantic Validation**: Strict limits on text length, voice modes, speed, and diffusion steps.
- **CORS Configured**: Ready for local Vite React development and container deployments.

## Setup & Running

1. Activate virtual environment:
   ```powershell
   .\.venv\Scripts\activate
   ```

2. Run tests:
   ```powershell
   pytest tests/
   ```

3. Start development server:
   ```powershell
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
