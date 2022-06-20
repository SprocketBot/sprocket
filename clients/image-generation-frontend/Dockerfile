ARG BASE_IMAGE
FROM $BASE_IMAGE AS test_image
ENTRYPOINT npm run test --workspace=clients/web

FROM $BASE_IMAGE AS app_image
RUN cp ./clients/web/src/config.template.json ./clients/web/src/config.json
RUN npm run build --workspace=clients/image-generation-frontend
ENTRYPOINT node /app/clients/image-generation-frontend/build/index.js
