FROM node:16-alpine AS base

WORKDIR /app

COPY package.json package-lock.json tsconfig.json tsconfig.build.json ./
COPY config config
COPY fonts fonts
COPY src src

RUN npm ci

FROM base AS app_image
RUN npm i @nestjs/cli
RUN npm run build
ENTRYPOINT node dist/main.js