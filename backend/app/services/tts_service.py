import os
import time
import uuid
import logging
from pathlib import Path
from typing import Optional, Tuple

import soundfile as sf
import torch

from app.core.config import settings
from app.schemas import TTSRequest, TTSResponse, ModelHealthResponse

logger = logging.getLogger("omnivoice.tts_service")

class TTSService:
    """
    Manages OmniVoice model loading and CPU inference.
    Follows project rule: Real OmniVoice CPU inference only; no mock TTS.
    """
    def __init__(self):
        self._model = None
        self._is_loading = False
        self._load_error: Optional[str] = None
        self._device = settings.TTS_DEVICE
        self._model_id = settings.OMNIVOICE_MODEL_ID

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    def get_status(self) -> ModelHealthResponse:
        if self._model is not None:
            status = "ready"
        elif self._is_loading:
            status = "loading"
        elif self._load_error is not None:
            status = "error"
        else:
            status = "unloaded"

        return ModelHealthResponse(
            status=status,
            model_id=self._model_id,
            device=self._device,
            is_loaded=self.is_loaded,
            error=self._load_error
        )

    def load_model(self) -> None:
        """Loads OmniVoice pretrained model onto CPU with float32 precision."""
        if self._model is not None:
            return

        self._is_loading = True
        self._load_error = None
        logger.info(f"Loading real OmniVoice model from '{self._model_id}' on {self._device}...")
        try:
            from omnivoice import OmniVoice
            
            # CPU inference requires float32 for maximum compatibility
            dtype = torch.float32
            start_t = time.time()
            self._model = OmniVoice.from_pretrained(
                self._model_id,
                device_map=self._device,
                dtype=dtype
            )
            elapsed = time.time() - start_t
            logger.info(f"OmniVoice model loaded successfully in {elapsed:.2f}s on {self._device}.")
        except Exception as e:
            self._load_error = str(e)
            logger.error(f"Failed to load OmniVoice model: {e}", exc_info=True)
            raise RuntimeError(f"Failed to load OmniVoice model: {e}")
        finally:
            self._is_loading = False

    def synthesize(self, request: TTSRequest) -> TTSResponse:
        """
        Executes real OmniVoice speech generation on CPU.
        """
        if not self.is_loaded:
            self.load_model()

        if self._model is None:
            raise RuntimeError(f"OmniVoice model is not loaded: {self._load_error}")

        # Clean text
        text = request.text.strip()
        if not text:
            raise ValueError("Input text cannot be empty.")

        # Determine generation kwargs
        gen_kwargs = {
            "text": text,
            "num_step": request.num_step,
            "speed": request.speed
        }

        # Apply voice design instruction if provided
        instruct = None
        if request.mode == "design" and request.instruct and request.instruct.strip():
            instruct = request.instruct.strip()
            gen_kwargs["instruct"] = instruct

        logger.info(f"Starting inference (num_step={request.num_step}, speed={request.speed}, instruct='{instruct}')...")
        start_infer = time.time()
        
        try:
            audio_arrays = self._model.generate(**gen_kwargs)
        except Exception as e:
            logger.error(f"Inference error during generation: {e}", exc_info=True)
            raise RuntimeError(f"Speech generation failed: {str(e)}")

        infer_time = time.time() - start_infer
        logger.info(f"Speech generation completed in {infer_time:.2f}s.")

        if not audio_arrays or len(audio_arrays) == 0:
            raise RuntimeError("Model returned no audio output.")

        audio_data = audio_arrays[0]
        sample_rate = settings.SAMPLE_RATE
        duration = len(audio_data) / float(sample_rate)

        # Generate unique, safe filename using UUID4
        safe_filename = f"speech_{uuid.uuid4().hex[:12]}.wav"
        output_dir = settings.resolved_output_dir
        output_path = output_dir / safe_filename

        # Write WAV file
        sf.write(str(output_path), audio_data, sample_rate)
        logger.info(f"WAV saved to {output_path} (size={output_path.stat().st_size} bytes, duration={duration:.2f}s).")

        return TTSResponse(
            status="success",
            filename=safe_filename,
            audio_url=f"/api/audio/{safe_filename}",
            duration=round(duration, 2),
            inference_time_sec=round(infer_time, 2),
            device=self._device,
            text=text,
            instruct=instruct
        )

# Global singleton service instance
tts_service = TTSService()
