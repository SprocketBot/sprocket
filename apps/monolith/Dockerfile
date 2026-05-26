ARG BASE_IMAGE=sprocket-monolith-base:latest
FROM $BASE_IMAGE AS app_image

RUN apk add --no-cache fontconfig
RUN mkdir -p /app/fonts && cp /app/microservices/image-generation-service/fonts/fonts.conf /app/fonts/fonts.conf
RUN npm run build --workspace=apps/monolith

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/healthz',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
ENTRYPOINT ["node", "/app/apps/monolith/dist/apps/monolith/src/main.js"]
