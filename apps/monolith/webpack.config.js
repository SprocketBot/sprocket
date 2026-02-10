module.exports = function (options, webpack) {
    const config = {
        ...options,
        target: 'node',
        node: {
            __dirname: false,
            __filename: false,
        },
        externals: [
            // Function to handle externals properly
            function ({ request }, callback) {
                const externals = [
                    '@grpc/grpc-js',
                    '@grpc/proto-loader',
                    'kafkajs',
                    'mqtt',
                    'nats',
                    'ioredis',
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
                    '@apollo/federation',
                    'graphql-redis-subscriptions',
                    'subscriptions-transport-ws',
                    'pg-native',
                    'discord-api-types',
                    'ts-morph',
                    'erlpack',
                    'zlib-sync',
                    'utf-8-validate',
                    'bufferutil',
                ];

                // Check if request matches any external
                if (externals.some(ext => request === ext || request.startsWith(ext + '/'))) {
                    return callback(null, 'commonjs ' + request);
                }

                callback();
            },
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
