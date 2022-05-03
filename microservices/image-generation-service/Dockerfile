FROM sprocket-core:local AS app_image
RUN npm run build --workspace=microservices/image-generation-service
ENTRYPOINT node /app/microservices/image-generation-service/dist/main.js