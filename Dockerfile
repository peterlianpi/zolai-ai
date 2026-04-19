FROM python:3.11-slim

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl build-essential \
    && rm -rf /var/lib/apt/lists/*

# Python deps (CPU-only torch to keep image small)
COPY requirements.txt .
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Install package
COPY pyproject.toml .
COPY zolai/ zolai/
RUN pip install --no-cache-dir -e .

# Copy project (data/ is gitignored — mount at runtime)
COPY scripts/ scripts/
COPY wiki/ wiki/
COPY config/ config/
COPY .env.example .env.example

# data/ is NOT copied — mount as volume
VOLUME ["/app/data"]

EXPOSE 8000

CMD ["uvicorn", "zolai.api.server:app", "--host", "0.0.0.0", "--port", "8000"]
