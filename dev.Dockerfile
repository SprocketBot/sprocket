FROM node:26-alpine

ARG SERVICE_PATH
ENV SERVICE_PATH=${SERVICE_PATH}

RUN apk add --no-cache python3 make g++ fontconfig

RUN npm i -g @nestjs/cli

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps apps
COPY common common
COPY core core
COPY clients clients
COPY microservices microservices

RUN mkdir -p /app/fonts && cp /app/microservices/image-generation-service/fonts/fonts.conf /app/fonts/fonts.conf

RUN npm i --legacy-peer-deps --include=optional
RUN npm run build --workspace=common

RUN if [ -f "${SERVICE_PATH}/package.json" ]; then \
      npm run build --workspace="${SERVICE_PATH}" 2>/dev/null || true; \
    fi

WORKDIR /app

CMD if echo "${SERVICE_PATH}" | grep -q "clients/web\|clients/image-generation-frontend"; then \
      cd "${SERVICE_PATH}" && npm run build && node build/index.js; \
    elif [ "${SERVICE_PATH}" = "apps/monolith" ]; then \
      cd "${SERVICE_PATH}" && npm run build && node dist/apps/monolith/src/main.js; \
    else \
      cd "${SERVICE_PATH}" && node dist/main.js; \
    fi
