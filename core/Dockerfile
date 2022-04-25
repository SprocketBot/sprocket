FROM node:16-alpine AS base

WORKDIR /app

COPY package.json package-lock.json tsconfig.json tsconfig.build.json jest.config.js ./
COPY config config
COPY src src

RUN npm i --ignore-scripts --force

FROM base AS test_image
RUN mkdir /app/secret && touch /app/secret/db-password.txt
RUN touch /app/secret/googleClientId.txt
RUN touch /app/secret/googleSecret.txt
RUN touch /app/secret/jwtSecret.txt
ENTRYPOINT npm run test

FROM base AS app_image
RUN npm i @nestjs/cli
RUN npm run build
ENTRYPOINT node dist/main.js
