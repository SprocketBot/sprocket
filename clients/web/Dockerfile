FROM sprocket-core:local AS test_image
ENTRYPOINT npm run test --workspace=clients/web

FROM sprocket-core:local AS app_image
RUN npm run build --workspace
ENTRYPOINT node /app/clients/web/build/index.js
