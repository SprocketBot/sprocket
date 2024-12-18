FROM oven/bun:1.1.40-alpine AS build

# Bit of a chicken and the egg problem here
# Web won't build without an API endpoint
# This might need to be changed to localhost or similar
# Building at runtime is not an option due to memory constraints
ENV PUBLIC_API_PORT=443
ENV PUBLIC_API_URL=api.preview.spr.ocket.gg
ENV PUBLIC_API_SECURE=true
ENV PRIVATE_API_URL=${PUBLIC_API_URL}
ENV PRIVATE_API_SECURE=${PUBLIC_API_SECURE}
ENV PRIVATE_API_PORT=${PUBLIC_API_PORT}

COPY . /app
WORKDIR /app
RUN bun i
# RUN cd /app/core && bun run build
# RUN cd /app/lib && bun run build
# RUN cd /app/services/matchmaking && bun run build
# RUN cd /app/clients/discord && bun run build

RUN cd /app/clients/web && bun run build

FROM oven/bun:1.1.40-alpine

ENV PUBLIC_API_PORT=443
ENV PUBLIC_API_URL=api.preview.spr.ocket.gg
ENV PUBLIC_API_SECURE=true

COPY --from=build /app /app
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]
