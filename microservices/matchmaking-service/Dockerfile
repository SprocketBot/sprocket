ARG BASE_IMAGE
FROM $BASE_IMAGE AS app_image
RUN npm run build --workspace=microservices/matchmaking-service
ENTRYPOINT node /app/microservices/matchmaking-service/dist/main.js