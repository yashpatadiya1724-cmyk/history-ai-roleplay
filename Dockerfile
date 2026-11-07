FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY datasets/ ./datasets/

EXPOSE 8000

ENV OLLAMA_BASE_URL=http://localhost:11434
ENV OLLAMA_MODEL=llama3

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
