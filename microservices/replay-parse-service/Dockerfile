FROM python:3.9 as app_image

WORKDIR /app
COPY . .

# Install system dependencies, install python packages, then remove system dependencies in a single layer
# This is necessary to build packages like numpy and pandas from source on the Debian-based slim image
# Also install Rust/Cargo for sprocket-boxcars-py dependency
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential python3-dev curl && \
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
    export PATH="$HOME/.cargo/bin:$PATH" && \
    apt-get remove -y curl && apt-get autoremove -y
RUN python3 -m pip install requests
ENV PATH="/root/.cargo/bin:$PATH"
RUN python3 -m pip install -r requirements.txt

ENTRYPOINT ["./start.sh"]
