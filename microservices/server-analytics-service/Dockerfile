FROM local/sprocket:temp AS app_image
RUN npm run build --workspace=microservices/server-analytics-service
ENTRYPOINT node /app/microservices/server-analytics-service/dist/main.js