FROM node:16-alpine as base

WORKDIR /app

COPY package.json package-lock.json ./
COPY clients clients
COPY common common
COPY core core
COPY microservices microservices

RUN npm i -g @nestjs/cli && npm i

RUN npm run build --workspace=common