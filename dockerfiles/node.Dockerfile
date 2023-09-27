FROM node:16-alpine as base

# Set current commit SHA in env
ARG COMMIT_SHA
ENV COMMIT_SHA=$COMMIT_SHA
RUN echo "Set env COMMIT_SHA=${COMMIT_SHA}"

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY clients clients
COPY common common
COPY core core
COPY microservices microservices

RUN npm i -g @nestjs/cli pnpm && pnpm i

RUN pnpm run --filter ./common build

