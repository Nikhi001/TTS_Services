import os
import re
import logging
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from app.core.config import settings
from app.schemas import TTSRequest, TTSResponse, HealthResponse, ModelHealthResponse
from app.services.tts_service import tts_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("omnivoice.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure output directory exists on startup
    out_dir = settings.resolved_output_dir
    logger.info(f"Backend started. Audio output directory: {out_dir}")
    logger.info(f"Allowed CORS origins: {settings.allowed_origins}")
    yield
    logger.info("Backend shutting down.")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="FastAPI backend for real OmniVoice Text-to-Speech synthesis running on CPU.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security: Safe filename pattern to prevent directory traversal
SAFE_FILENAME_REGEX = re.compile(r"^[a-zA-Z0-9_\-]+\.wav$")

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Liveness probe: verifies that the FastAPI process is running."""
    return HealthResponse(
        status="healthy",
        service="omnivoice-fastapi",
        version=settings.APP_VERSION
    )

@app.get("/health/model", response_model=ModelHealthResponse, tags=["Health"])
async def model_health_check():
    """Readiness probe: reports model loading status without exposing secrets."""
    return tts_service.get_status()

@app.post("/api/tts", response_model=TTSResponse, tags=["TTS"])
async def generate_speech(request: TTSRequest):
    """
    Generate speech from text using the real OmniVoice model on CPU.
    Validates input parameters and returns the generated WAV audio URL.
    """
    logger.info(f"Received TTS request: '{request.text[:40]}...' (mode={request.mode})")
    try:
        response = tts_service.synthesize(request)
        return response
    except ValueError as ve:
        logger.warning(f"Validation error: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Inference failure: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Speech synthesis error: {str(e)}"
        )

@app.get("/api/audio/{filename}", tags=["Audio"])
async def get_audio_file(filename: str):
    """
    Safely retrieves a generated WAV file.
    Validates filename to prevent path traversal.
    """
    if not SAFE_FILENAME_REGEX.match(filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename requested."
        )

    output_dir = settings.resolved_output_dir.resolve()
    requested_file = (output_dir / filename).resolve()

    # Ensure requested path is strictly within output_dir
    try:
        requested_file.relative_to(output_dir)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied."
        )

    if not requested_file.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audio file '{filename}' was not found."
        )

    return FileResponse(
        path=str(requested_file),
        media_type="audio/wav",
        filename=filename
    )
