FROM python:3.13-slim

WORKDIR /api

# Install system dependencies (needed for some python packages like psycopg2/asyncpg if they need to build)
RUN apt-get update && apt-get install -y gcc

# Copy requirements first to leverage cache
COPY ./api/requirements.txt /api/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /api/requirements.txt

# Copy the rest of the application
COPY ./api /api

# Command is handled by docker-compose, but we set a default here
CMD ["uvicorn", "main:app", "host", "0.0.0.0", "--port", "8000"]
