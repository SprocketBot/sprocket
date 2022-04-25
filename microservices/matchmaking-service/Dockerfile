FROM node:16-alpine AS base

WORKDIR /app

COPY package.json package-lock.json tsconfig.json tsconfig.build.json jest.config.js ./
COPY config config
COPY src src

RUN npm ci --ignore-scripts

FROM base AS test_image
ENTRYPOINT npm run test

FROM base AS app_image
RUN npm i @nestjs/cli
RUN npm run build
ENTRYPOINT node dist/main.js
