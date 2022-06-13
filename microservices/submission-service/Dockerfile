ARG BASE_IMAGE
FROM $BASE_IMAGE AS app_image
RUN npm run build --workspace=microservices/submission-service
ENTRYPOINT node /app/microservices/submission-service/dist/main.js
