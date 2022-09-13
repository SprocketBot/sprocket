ARG BASE_IMAGE
FROM $BASE_IMAGE AS test_image
ENTRYPOINT npm run test --workspace=clients/image-generation-frontend

FROM $BASE_IMAGE AS app_image
RUN cp ./clients/image-generation-frontend/src/config.template.json ./clients/image-generation-frontend/src/config.json
RUN npm run build --workspace=clients/image-generation-frontend
ENTRYPOINT node /app/clients/image-generation-frontend/build/index.js
