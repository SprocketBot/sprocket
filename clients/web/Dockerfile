ARG BASE_IMAGE
FROM $BASE_IMAGE AS test_image
ENTRYPOINT npm run test --workspace=clients/web

FROM $BASE_IMAGE AS app_image
RUN DISABLE_CONFIG=true npm run gen-sdl --workspace=core
RUN cp /app/core/schema.graphql /app/clients/web/schema.graphql
RUN npm run build --workspace=clients/web
ENTRYPOINT node /app/clients/web/build/index.js
