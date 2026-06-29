import "reflect-metadata";

import {PostgresService} from "@sprocketbot/common";

jest.mock("../franchise", () => ({
    PlayerService: class PlayerService {},
}));
jest.mock("../game", () => ({
    GameFeatureService: class GameFeatureService {},
    GameService: class GameService {},
}));
jest.mock("../organization", () => ({
    OrganizationService: class OrganizationService {},
}));
jest.mock("./elo-connector", () => ({
    EloConnectorService: class EloConnectorService {},
    EloEndpoint: {
        CalculateSalaries: "calculate-salaries",
        CompactGraph: "compact-graph",
    },
}));

import {EloConsumer} from "./elo.consumer";

describe("EloConsumer", () => {
    it("emits constructor metadata for Nest dependency injection", () => {
        const paramTypes = Reflect.getMetadata("design:paramtypes", EloConsumer) as unknown[];

        expect(paramTypes).toHaveLength(7);
        expect(paramTypes[6]).toBe(PostgresService);
    });
});
