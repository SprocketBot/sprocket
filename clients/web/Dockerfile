FROM node:16-alpine AS base

WORKDIR /app

COPY package.json package-lock.json tsconfig.json svelte.config.js tailwind.config.cjs postcss.config.cjs ./
COPY src src
COPY static static

RUN npm ci --ignore-scripts

FROM base AS test_image
ENTRYPOINT npm run test

FROM base AS app_image
RUN cp src/config.template.json src/config.json && npm run build
ENTRYPOINT node /app/build/index.js
