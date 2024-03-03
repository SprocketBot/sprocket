ARG BASE_IMAGE
FROM $BASE_IMAGE AS app_image
RUN npm run build --workspace=microservices/notification-service
ENTRYPOINT node /app/microservices/notification-service/dist/main.js