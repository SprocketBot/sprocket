import {ScheduleGroupService} from "./schedule-group.service";
import type {RawFixture} from "./schedule-groups.types";

function repositoryMock(): {
    create: jest.Mock;
    merge: jest.Mock;
    save: jest.Mock;
    insert: jest.Mock;
    findOneOrFail: jest.Mock;
} {
    return {
        create: jest.fn((value: object) => ({...value})),
        merge: jest.fn((target: object, value: object) => Object.assign(target, value)),
        save: jest.fn(async (value: object) => value),
        insert: jest.fn(async () => undefined),
        findOneOrFail: jest.fn(),
    };
}

describe("ScheduleGroupService.createSeasonSchedule", () => {
    it("does not reserve an unrelated QueryRunner connection", async () => {
        const scheduleGroupRepo = repositoryMock();
        const seasonRepo = repositoryMock();
        seasonRepo.create.mockReturnValue({matches: [] });
        const matchRepo = repositoryMock();
        const seasonBridgeRepo = repositoryMock();
        const matchBridgeRepo = repositoryMock();
        const scheduleFixtureService = {createScheduleFixture: jest.fn()};
        const skillGroupRepo = repositoryMock();
        const service = new ScheduleGroupService(
            scheduleGroupRepo as never,
            seasonRepo as never,
            matchRepo as never,
            seasonBridgeRepo as never,
            matchBridgeRepo as never,
            scheduleFixtureService as never,
            skillGroupRepo as never,
        );

        const result = await service.createSeasonSchedule(42, [] as unknown as RawFixture);

        expect(result).toHaveLength(1);
        expect(seasonBridgeRepo.insert).toHaveBeenCalledWith({
            scheduleGroupId: undefined,
            seasonNumber: 42,
        });
        expect(scheduleFixtureService.createScheduleFixture).not.toHaveBeenCalled();
    });
});
