const mockCloseSharedPostgresPool = jest.fn().mockResolvedValue(undefined);

jest.mock("./pool", () => ({
    closeSharedPostgresPool: mockCloseSharedPostgresPool,
    getSharedPostgresPool: jest.fn(),
}));

import {PostgresService} from "./postgres.service";

describe("PostgresService lifecycle", () => {
    it("closes the process pool in the final application-shutdown phase", async () => {
        const service = new PostgresService();

        await service.onApplicationShutdown();

        expect(mockCloseSharedPostgresPool).toHaveBeenCalledTimes(1);
    });
});
