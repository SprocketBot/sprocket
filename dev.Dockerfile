# Base stage with all source code and installed dependencies
FROM node:16-alpine as base
WORKDIR /app

# Copy all source code and package files
COPY . .

# Install all workspace dependencies
RUN npm install

# Build the common workspace, as it's a dependency for others
RUN npm run build --workspace=common

# Final stage for a specific service
FROM base as final
ARG SERVICE_PATH
WORKDIR /app

# Build the specific service
RUN npm run build --workspace=${SERVICE_PATH}

# Set the entrypoint for the service
ENTRYPOINT node ${SERVICE_PATH}/dist/main.js
