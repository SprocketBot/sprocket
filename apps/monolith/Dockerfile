ARG BASE_IMAGE=node:26-alpine
FROM $BASE_IMAGE AS app_image

RUN apk add --no-cache python3 make g++ fontconfig

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
RUN npm run build --workspace=apps/monolith

ENV NODE_CONFIG_DIR=/app/core/config
ENV FONTCONFIG_PATH=/app/fonts

EXPOSE 3001

HEALTHCHECK --interval=15s --timeout=30s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/healthz',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "/app/apps/monolith/dist/apps/monolith/src/main.js"]
