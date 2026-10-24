from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict

class TTSRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "text": "Hello, welcome to OmniVoice speech synthesis running on FastAPI.",
                "mode": "auto",
                "instruct": None,
                "num_step": 16,
                "speed": 1.0
            }
        }
    )

    text: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Text to synthesize into speech (1-500 characters)"
    )
    mode: Literal["auto", "design"] = Field(
        default="auto",
        description="Voice synthesis mode: 'auto' (automatic speaker) or 'design' (prompted voice design)"
    )
    instruct: Optional[str] = Field(
        default=None,
        max_length=200,
        description="Speaker attributes for voice design mode (e.g. 'female, low pitch, american accent')"
    )
    num_step: int = Field(
        default=16,
        ge=8,
        le=64,
        description="Number of diffusion inference steps (16 recommended for CPU, 32 for higher quality)"
    )
    speed: float = Field(
        default=1.0,
        ge=0.5,
        le=2.0,
        description="Speech speed factor (0.5 = slow, 1.0 = normal, 2.0 = fast)"
    )

class TTSResponse(BaseModel):
    status: str = "success"
    filename: str
    audio_url: str
    duration: Optional[float] = None
    inference_time_sec: float
    device: str
    text: str
    instruct: Optional[str] = None

class HealthResponse(BaseModel):
    status: str = "healthy"
    service: str = "omnivoice-fastapi"
    version: str = "0.1.0"

class ModelHealthResponse(BaseModel):
    status: str = Field(..., description="'ready', 'loading', 'error', or 'unloaded'")
    model_id: str
    device: str
    is_loaded: bool
    error: Optional[str] = None
