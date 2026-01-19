FROM node:18-alpine as base

# Set current commit SHA in env
ARG COMMIT_SHA
ENV COMMIT_SHA=$COMMIT_SHA
RUN echo "Set env COMMIT_SHA=${COMMIT_SHA}"

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
COPY clients clients
COPY common common
COPY core core
COPY microservices microservices

RUN npm i -g @nestjs/cli && npm i --legacy-peer-deps --include=optional

RUN npm run build --workspace=common

