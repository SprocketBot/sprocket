ARG BASE_IMAGE
FROM $BASE_IMAGE AS app_image
RUN npm run build --workspace=microservices/server-analytics-service
ENTRYPOINT node /app/microservices/server-analytics-service/dist/main.js