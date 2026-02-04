FROM node:16-alpine

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY common/package*.json ./common/

# Install dependencies
RUN npm install

# Build common library
COPY common ./common
RUN npm run build:common

# Copy all service code
COPY core ./core
COPY clients ./clients
COPY microservices ./microservices
COPY apps ./apps

# Accept service path as build argument
ARG SERVICE_PATH
ENV SERVICE_PATH=${SERVICE_PATH}

# Set working directory to the service
WORKDIR /app/${SERVICE_PATH}

# Install service-specific dependencies
RUN npm install

# Build the service
RUN npm run build || echo "Build skipped for development"

# Expose port 3001 (for services that need it)
EXPOSE 3001

# Default command - can be overridden in docker-compose
CMD ["npm", "run", "dev"]
