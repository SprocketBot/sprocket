FROM node:16-alpine
WORKDIR /app
COPY . .
ENTRYPOINT npm run dev --workspace=clients/web -- --host
