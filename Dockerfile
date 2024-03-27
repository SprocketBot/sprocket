FROM oven/bun:1.0.30-alpine as build

ENV PUBLIC_API_PORT=443
ENV PUBLIC_API_URL=api.preview.spr.ocket.gg
ENV PUBLIC_API_SECURE=true

COPY . /app
WORKDIR /app
RUN bun i
RUN cd /app/core && bun run build
RUN cd /app/lib && bun run build
RUN cd /app/services/matchmaking && bun run build
RUN cd /app/clients/discord && bun run build


FROM node:20-alpine

ENV PUBLIC_API_PORT=443
ENV PUBLIC_API_URL=api.preview.spr.ocket.gg
ENV PUBLIC_API_SECURE=true

COPY --from=build /app /app
RUN cd /app/clients/web && npm run build
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]
