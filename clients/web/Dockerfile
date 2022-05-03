ARG BASE_IMAGE
FROM $BASE_IMAGE AS test_image
ENTRYPOINT npm run test --workspace=clients/web

FROM $BASE_IMAGE AS app_image
RUN npm run build --workspace
ENTRYPOINT node /app/clients/web/build/index.js
