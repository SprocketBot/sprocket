ARG BASE_IMAGE
FROM $BASE_IMAGE AS test_image
ENTRYPOINT npm run test --workspace=clients/discord-bot

FROM $BASE_IMAGE AS app_image
RUN npm run build --workspace=clients/discord-bot
ENTRYPOINT node /app/clients/discord-bot/dist/main.js
