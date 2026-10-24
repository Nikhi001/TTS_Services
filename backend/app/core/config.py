import os
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "OmniVoice TTS API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    
    # Model configuration
    OMNIVOICE_MODEL_ID: str = Field(
        default=os.getenv("OMNIVOICE_MODEL_ID", "k2-fsa/OmniVoice"),
        description="HuggingFace model ID or local path to OmniVoice weights"
    )
    TTS_DEVICE: str = Field(
        default=os.getenv("TTS_DEVICE", "cpu"),
        description="Inference device: 'cpu' for this project roadmap"
    )
    
    # Audio Output configuration
    OUTPUT_DIR: str = Field(
        default=os.getenv("OUTPUT_DIR", "outputs"),
        description="Directory relative to backend root to store generated WAV files"
    )
    
    # Limits & Validation
    MAX_TEXT_LENGTH: int = 500
    MIN_TEXT_LENGTH: int = 1
    DEFAULT_DIFFUSION_STEPS: int = 32
    FAST_DIFFUSION_STEPS: int = 16
    SAMPLE_RATE: int = 24000
    
    # CORS
    FRONTEND_ORIGIN: str = Field(
        default=os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"),
        description="Allowed frontend CORS origin"
    )

    @property
    def allowed_origins(self) -> List[str]:
        origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:8080",
            "http://127.0.0.1:8080"
        ]
        if self.FRONTEND_ORIGIN and self.FRONTEND_ORIGIN not in origins:
            origins.append(self.FRONTEND_ORIGIN)
        return origins

    @property
    def resolved_output_dir(self) -> Path:
        backend_root = Path(__file__).resolve().parent.parent.parent
        out = backend_root / self.OUTPUT_DIR
        out.mkdir(parents=True, exist_ok=True)
        return out

settings = Settings()
