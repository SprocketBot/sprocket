#!/bin/sh

set -xe

case "$1" in 
    exec)
        case "$2" in
            core)
                # Propagate the config file
                cp /app/config.yaml /app/core/config.yaml
                cd /app/core
                bun --preload /app/lib/src/tracing.ts -b /app/core/src/main.ts
                # bun --preload /app/lib/dist/src/tracing.js --node /app/core/dist/main.js
                # node -r /app/lib/dist/src/tracing.js /app/core/dist/main.js
                ;;
            web)
                cd /app/clients/web
                bun ./build/index.js
                ;;
            discord)
                cd /app/clients/discord
                cp /app/config.yaml /app/clients/discord/config.yaml
                bun --preload /app/lib/src/tracing.ts /app/clients/discord/src/main.ts
                ;;
            service)
                cd /app/services/$3
                cp /app/config.yaml /app/services/$3/config.yaml
                bun --preload /app/lib/src/tracing.ts /app/services/$3/src/main.ts
        esac
        exit 0;
        ;;
    *)
        echo "Unknown Command!"
        exit 1
        ;;
esac