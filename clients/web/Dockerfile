ARG BASE_IMAGE
FROM $BASE_IMAGE AS test_image
RUN mkdir -p /app/clients/web/secret && touch /app/clients/web/secret/chatwoot-hmac-key.txt
ENTRYPOINT npm run test --workspace=clients/web

FROM $BASE_IMAGE AS app_image
RUN mkdir -p /app/clients/web/secret && touch /app/clients/web/secret/chatwoot-hmac-key.txt
RUN npm run build --workspace=clients/web
ENTRYPOINT node /app/clients/web/build/index.js
