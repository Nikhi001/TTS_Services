FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    TTS_DEVICE=cpu \
    OUTPUT_DIR=outputs

# Install system dependencies required for audio processing (soundfile, librosa)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    ffmpeg \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency definition
COPY requirements.txt .

# Install CPU PyTorch and backend requirements
RUN pip install --upgrade pip && \
    pip install torch==2.14.1+cpu torchaudio==2.11.0+cpu --index-url https://download.pytorch.org/whl/cpu && \
    pip install -r requirements.txt

# Copy application source code
COPY app/ ./app/

# Create audio output directory
RUN mkdir -p /app/outputs

EXPOSE 8000

# Health check probe
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=60s \
    CMD curl -f http://localhost:8000/health || exit 1

# Production ASGI server command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
