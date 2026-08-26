FROM node:18-alpine

ARG SERVICE_PATH

RUN apk add --no-cache python3 make g++

RUN npm i -g @nestjs/cli

WORKDIR /app

COPY package.json package-lock.json ./
COPY common common
COPY core core
COPY clients clients
COPY microservices microservices

RUN npm i --legacy-peer-deps --include=optional
RUN npm run build --workspace=common

RUN if [ -f "${SERVICE_PATH}/package.json" ]; then \
      npm run build --workspace="${SERVICE_PATH}" 2>/dev/null || true; \
    fi

WORKDIR /app

CMD if echo "${SERVICE_PATH}" | grep -q "clients/web\|clients/image-generation-frontend"; then \
      cd "${SERVICE_PATH}" && npm run build && node build/index.js; \
    else \
      cd "${SERVICE_PATH}" && node dist/main.js; \
    fi
