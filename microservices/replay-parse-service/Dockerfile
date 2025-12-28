FROM python:3.13 as app_image

WORKDIR /app
COPY . .

# Install system dependencies, install python packages, then remove system dependencies in a single layer
# This is necessary to build packages like numpy and pandas from source on the Debian-based slim image
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential python3-dev
RUN python3 -m pip install requests
RUN python3 -m pip install -r requirements.txt
RUN python3 -m pip install opentelemetry-api opentelemetry-sdk opentelemetry-exporter-otlp

ENTRYPOINT ["./start.sh"]
