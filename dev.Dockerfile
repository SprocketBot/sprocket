# Base stage with all source code and installed dependencies
# Use regular node (not alpine) to avoid native module build issues
FROM node:18 as base
RUN apt-get update && apt-get install -y postgresql-client
WORKDIR /app

# Copy all source code and package files (but exclude node_modules)
COPY package*.json ./
COPY ./ ./

# Remove any node_modules that may have been copied (from macOS/different arch)
RUN rm -rf node_modules */node_modules */*/node_modules

# Install dependencies fresh in the container
# --legacy-peer-deps: avoid peer dependency conflicts
# --include=optional: ensure platform-specific binaries are installed
RUN npm install --legacy-peer-deps --include=optional

# Verify esbuild platform package is installed
RUN ls -la node_modules/ | grep esbuild || echo "Warning: esbuild packages not found"

# Build the common workspace, as it's a dependency for others
RUN npm run build --workspace=common

# Final stage for a specific service
FROM base as final
ARG SERVICE_PATH
WORKDIR /app

# Build the specific service
RUN npm run build --workspace=${SERVICE_PATH}

# Create a startup script that handles different service types
RUN if [ "${SERVICE_PATH}" = "core" ]; then \
        echo '#!/bin/sh' > /start.sh && \
        echo 'echo "Waiting for postgres..."' >> /start.sh && \
        echo 'until pg_isready -h postgres -p 5432 -U sprocketbot; do' >> /start.sh && \
        echo '  sleep 1' >> /start.sh && \
        echo 'done' >> /start.sh && \
        echo 'echo "Postgres is up - executing command"' >> /start.sh && \
        echo 'exec node '${SERVICE_PATH}'/dist/main.js' >> /start.sh; \
    else \
        echo '#!/bin/sh' > /start.sh && \
        echo 'if [ -f "'${SERVICE_PATH}'/build/index.js" ]; then' >> /start.sh && \
        echo '  echo "Starting SvelteKit app..."' >> /start.sh && \
        echo '  exec node '${SERVICE_PATH}'/build/index.js' >> /start.sh && \
        echo 'elif [ -f "'${SERVICE_PATH}'/dist/main.js" ]; then' >> /start.sh && \
        echo '  echo "Starting NestJS/backend service..."' >> /start.sh && \
        echo '  exec node '${SERVICE_PATH}'/dist/main.js' >> /start.sh && \
        echo 'else' >> /start.sh && \
        echo '  echo "Error: Could not find entry point"' >> /start.sh && \
        echo '  exit 1' >> /start.sh && \
        echo 'fi'; \
    fi && \
    chmod +x /start.sh


# Use the startup script
ENTRYPOINT ["/start.sh"]
