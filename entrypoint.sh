#!/bin/sh

set -xe

case "$1" in 
    exec)
        case "$2" in
            core)
                # Propagate the config file
                cp /app/config.yaml /app/core/config.yaml
                cd /app/core
                # bun --preload /app/lib/src/tracing.ts -b /app/core/src/main.ts
                # bun --preload /app/lib/dist/src/tracing.js --node /app/core/dist/main.js
                node -r /app/lib/dist/src/tracing.js /app/core/dist/main.js
                ;;
            web)
                cd /app/clients/web
                node ./build/index.js
                ;;
            discord)
                cd /app/clients/discord
                cp /app/config.yaml /app/clients/discord/config.yaml
                node -r /app/lib/dist/src/tracing.js /app/clients/discord/dist/main.js
                ;;
            service)
                cd /app/services/$3
                cp /app/config.yaml /app/services/$3/config.yaml
                node -r /app/lib/dist/src/tracing.js /app/services/$3/dist/main.js
        esac
        exit 0;
        ;;
    *)
        echo "Unknown Command!"
        exit 1
        ;;
esac