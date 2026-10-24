# OmniVoice + FastAPI + React Web Application

A full-stack Text-to-Speech (TTS) web application leveraging the state-of-the-art [OmniVoice](https://github.com/k2-fsa/OmniVoice) model with a FastAPI backend and a modern React frontend.

## Architecture

- **Model:** Official OmniVoice model running on CPU.
- **Backend:** FastAPI, Pydantic, Uvicorn, SoundFile.
- **Frontend:** React, HTML5, Vanilla CSS, Vite.
- **Inference Mode:** CPU-first execution for cross-platform compatibility.

## Structure

```text
omnivoice-webapp/
├── model/           # Reference / clone of upstream k2-fsa/OmniVoice
├── backend/         # FastAPI application, schemas, and TTS service
├── frontend/        # React user interface
├── docs/            # Project documentation and specifications
└── deploy/          # Docker and container deployment configs
```

## Quick Start

See [PROJECT_PLAN.md](docs/PROJECT_PLAN.md) for full project roadmap and milestone specifications.
