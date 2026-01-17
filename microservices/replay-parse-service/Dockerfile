FROM python:3.10 AS app_image

WORKDIR /app
COPY . .

# Install system dependencies for building Python packages and Rust/Cargo for boxcars-py
# Build essential is needed for numpy, pandas, and Rust compilation
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        python3-dev \
        curl \
        git && \
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
    rm -rf /var/lib/apt/lists/*

# Add Rust to PATH
ENV PATH="/root/.cargo/bin:$PATH"

# Install Python dependencies (boxcars-py will be compiled from source using Rust)
RUN python3 -m pip install --no-cache-dir -r requirements.txt

ENTRYPOINT ["./start.sh"]
