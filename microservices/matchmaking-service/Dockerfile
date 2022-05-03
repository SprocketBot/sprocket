FROM sprocket-core:local AS app_image
RUN npm run build --workspace=microservices/matchmaking-service
ENTRYPOINT node /app/microservices/matchmaking-service/dist/main.js