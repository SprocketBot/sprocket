ARG BASE_IMAGE
FROM $BASE_IMAGE AS test_image
RUN mkdir /app/secret && touch /app/secret/db-password.txt
RUN touch /app/secret/googleClientId.txt
RUN touch /app/secret/googleSecret.txt
RUN touch /app/secret/jwtSecret.txt
ENTRYPOINT npm run test --workspace=core

FROM $BASE_IMAGE AS app_image
RUN npm run build --workspace=core
ENTRYPOINT node /app/core/dist/main.js
