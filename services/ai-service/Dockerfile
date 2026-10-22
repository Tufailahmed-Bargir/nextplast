FROM python:3.12-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libglib2.0-0 libgl1 libxcb1 libsm6 libxext6 libxrender1 \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces runs containers as uid 1000.
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    YOLO_CONFIG_DIR=/home/user/.config/Ultralytics
WORKDIR /home/user/app

# CPU-only torch keeps the image small and starts faster than the CUDA build.
RUN pip install --no-cache-dir torch==2.6.0 torchvision==0.21.0 \
    --index-url https://download.pytorch.org/whl/cpu

COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=user . .

EXPOSE 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
