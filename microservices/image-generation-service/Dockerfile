ARG BASE_IMAGE
FROM $BASE_IMAGE AS app_image
RUN apk add fontconfig
COPY fonts/fonts.conf /app/fonts/fonts.conf
RUN npm run build --workspace=microservices/image-generation-service
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3014/healthz',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
ENTRYPOINT node /app/microservices/image-generation-service/dist/main.js
