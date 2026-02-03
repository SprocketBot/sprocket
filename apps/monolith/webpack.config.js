module.exports = function (options, webpack) {
    const config = {
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
            '@apollo/federation',
            '@apollo/federation/dist/directives',
            '@nestjs/websockets/socket-module',
            'ts-morph',
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
        ignoreWarnings: [
            {
                module: /node_modules\/@nestjs/,
            },
        ],
    };

    // Suppress optional dependency errors
    config.stats = {
        ...config.stats,
        errorDetails: false,
        warnings: false,
    };

    return config;
};
