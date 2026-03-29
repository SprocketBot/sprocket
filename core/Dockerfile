ARG BASE_IMAGE
FROM $BASE_IMAGE AS test_image
RUN mkdir -p /app/secret && touch /app/secret/db-password.txt
RUN touch /app/secret/googleClientId.txt
RUN touch /app/secret/googleSecret.txt
RUN touch /app/secret/jwtSecret.txt
ENTRYPOINT npm run test --workspace=core

FROM $BASE_IMAGE AS app_image
RUN npm run build --workspace=core
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/healthz',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
ENTRYPOINT node /app/core/dist/main.js
