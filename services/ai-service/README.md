# NexPlast AI Service
#
# Separate FastAPI microservice for plastic detection (YOLOv8).
# The Next.js app never exposes this service to the browser — only
# authenticated server-side proxies under `/api/ai/*` call it.

## Stack

- Python 3.12
- FastAPI + Pydantic
- Ultralytics YOLOv8 (`yolov8n` by default)
- OpenCV + Pillow + NumPy + Torch

## Layout

```
services/ai-service/
  app/
    api/          # REST routes + API-key dependency
    models/       # ModelLoader (versioned YOLO weights)
    schemas/      # Request/response contracts
    services/     # Detection, preprocessing, confidence, weight
    utils/        # Class taxonomy + hashing
    config/       # Settings (env-driven, no hardcoded paths)
  models/         # Downloaded / mounted weight files
  tests/
  requirements.txt
```

## Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | none | Liveness + model load status |
| GET | `/version` | none | Service + model version metadata |
| POST | `/detect` | `X-AI-API-Key` | Multipart image → detections |

### `POST /detect` response (summary)

- `detected_class`, `detected_count`, `confidence`, `decision`
- `boxes[]` normalized bounding boxes
- `plastic_types[]`
- `estimated_weight_grams` (preview only)
- `processing_time_ms`
- `model_name` / `model_version`
- `image` metadata + `content_hash`
- `raw_output` / `parsed_output`

Supported classes: PET Bottle, HDPE Bottle, Plastic Bag, Milk Packet,
Container, Cup, Bottle Cap, Bucket, PVC, Can, Other.

## Setup

```bash
cd services/ai-service
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # or cp on Unix
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

First startup downloads `yolov8n.pt` via Ultralytics if missing.

## Next.js wiring

In the Next.js `.env` (do not commit secrets):

```
AI_SERVICE_URL=http://127.0.0.1:8001
AI_SERVICE_API_KEY=nexplast-dev-ai-key
```

## Future extension points (not implemented)

- Redis caching of detection hashes
- Background job queues for batch inference
- Prometheus / OpenTelemetry monitoring
- Docker Compose multi-service deploy

## Tests

```bash
pytest
```
