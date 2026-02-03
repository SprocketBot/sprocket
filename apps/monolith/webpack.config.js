module.exports = function (options, webpack) {
    return {
        ...options,
        externals: [
            // Externalize optional microservice transport dependencies
            '@grpc/grpc-js',
            '@grpc/proto-loader',
            'kafkajs',
            'mqtt',
            'nats',
            'ioredis',
            // Externalize native modules and optional dependencies
            'canvas',
            'sharp',
            'class-transformer/storage',
            'apollo-server-fastify',
            'fastify',
            'point-of-view',
            'apollo-server-cache-memcached',
            'chokidar',
            'graphql-tools',
            '@apollo/gateway',
            'graphql-redis-subscriptions',
            'subscriptions-transport-ws',
            'pg-native',
            'discord-api-types',
        ],
        module: {
            ...options.module,
            rules: [
                ...options.module.rules,
                {
                    test: /\.node$/,
                    use: 'node-loader',
                },
            ],
        },
    };
};
