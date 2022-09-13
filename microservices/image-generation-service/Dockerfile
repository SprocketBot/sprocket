ARG BASE_IMAGE
FROM $BASE_IMAGE AS app_image
RUN apk add fontconfig
COPY fonts/fonts.conf /app/fonts/fonts.conf
RUN npm run build --workspace=microservices/image-generation-service
ENTRYPOINT node /app/microservices/image-generation-service/dist/main.js
