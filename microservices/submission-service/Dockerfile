ARG BASE_IMAGE
FROM $BASE_IMAGE AS app_image
RUN npm run build --workspace=microservices/submission-service
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3012/healthz',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
ENTRYPOINT node /app/microservices/submission-service/dist/main.js
