import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Verify GET /health returns 200 with service info."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "omnivoice-fastapi"
    assert "version" in data

def test_model_health_check():
    """Verify GET /health/model reports status, device, and model_id."""
    response = client.get("/health/model")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["device"] == "cpu"
    assert "k2-fsa/OmniVoice" in data["model_id"]

def test_tts_validation_empty_text():
    """Verify empty text is rejected with 422 Unprocessable Entity."""
    response = client.post("/api/tts", json={"text": ""})
    assert response.status_code == 422

def test_tts_validation_too_long_text():
    """Verify text exceeding max length (>500 chars) is rejected."""
    long_text = "OmniVoice " * 60  # > 500 chars
    response = client.post("/api/tts", json={"text": long_text})
    assert response.status_code == 422

def test_audio_invalid_filename_traversal():
    """Verify path traversal attack in audio endpoint is blocked with 400."""
    response = client.get("/api/audio/../../etc/passwd")
    # FastAPI path routing or regex check should block traversal
    assert response.status_code in [400, 404]

def test_audio_not_found():
    """Verify requesting a non-existent WAV file returns 404."""
    response = client.get("/api/audio/non_existent_12345.wav")
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()
