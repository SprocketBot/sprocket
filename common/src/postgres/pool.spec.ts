const mockPoolConstructor = jest.fn();

jest.mock("pg", () => ({
    Pool: mockPoolConstructor,
}));

jest.mock("../util", () => ({
    config: {
        db: {
            host: "db.example.test",
            port: 5432,
            username: "sprocket",
            password: "secret",
            database: "sprocket",
            pool_size: 1,
            pool_idle_timeout_ms: 10000,
            pool_connection_timeout_ms: 5000,
            pool_max_lifetime_seconds: 300,
            idle_in_transaction_timeout_ms: 60000,
            application_name: "monolith",
        },
    },
}));

import {buildPostgresPoolConfig} from "./pool";

describe("buildPostgresPoolConfig", () => {
    it("bounds and expires managed database sessions", () => {
        expect(buildPostgresPoolConfig("common")).toMatchObject({
            max: 1,
            idleTimeoutMillis: 10000,
            connectionTimeoutMillis: 5000,
            maxLifetimeSeconds: 300,
            idle_in_transaction_session_timeout: 60000,
            application_name: "monolith.common",
        });
    });
});
