FROM local/sprocket:temp AS test_image
ENTRYPOINT npm run test --workspace=clients/discord-bot

FROM local/sprocket:temp AS app_image
RUN npm run build --workspace=clients/discord-bot
ENTRYPOINT node /app/clients/discord-bot/dist/main.js
