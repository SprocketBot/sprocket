import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";
import type {Scrim} from "@sprocketbot/common";
import {ScrimMode, ScrimStatus} from "@sprocketbot/common";
import {add, sub} from "date-fns";
import {now} from "lodash";

import {ScrimGroupService} from "../scrim-group/scrim-group.service";
import {GameOrderService} from "./game-order.service";

describe("GameOrderService", () => {
    let service: GameOrderService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameOrderService, ScrimGroupService],
        }).compile();

        service = module.get<GameOrderService>(GameOrderService);
    });

    describe("generateRoundRobinGameOrder", () => {
        it("Should not fail to generate a doubles round robin", () => {
            const scrim: Scrim = {
                id: "scrim-testdummy1234",
                createdAt: sub(now(), {minutes: 20}),
                updatedAt: sub(now(), {minutes: 20}),

                status: ScrimStatus.POPPED,

                authorId: 1337,
                organizationId: 1,
                gameModeId: 2,
                skillGroupId: 2,
                submissionId: "scrim-dummydummy321",
                
                settings: {
                    teamSize: 3,
                    teamCount: 2,
                    mode: ScrimMode.ROUND_ROBIN,
                    competitive: true,
                    observable: false,
                    checkinTimeout: 2000,
                },
                players: [
                    {
                        id: 8,
                        name: "A",
                        joinedAt: sub(now(), {minutes: 20}),
                        leaveAt: add(now(), {seconds: 360}),
                    },
                    {
                        id: 9,
                        name: "B",
                        joinedAt: sub(now(), {minutes: 20}),
                        leaveAt: add(now(), {seconds: 360}),
                    },
                    {
                        id: 10,
                        name: "C",
                        joinedAt: sub(now(), {minutes: 20}),
                        leaveAt: add(now(), {seconds: 360}),
                    },
                    {
                        id: 11011588,
                        name: "D",
                        joinedAt: sub(now(), {minutes: 20}),
                        leaveAt: add(now(), {seconds: 360}),
                    },
                    {
                        id: 11010578,
                        name: "E",
                        joinedAt: sub(now(), {minutes: 20}),
                        leaveAt: add(now(), {seconds: 360}),
                    },
                    {
                        id: 4975,
                        name: "F",
                        joinedAt: sub(now(), {minutes: 20}),
                        leaveAt: add(now(), {seconds: 360}),
                    },
                ],
            };
            const result = service.generateGameOrder(scrim);
            // eslint-disable-next-line no-console
            console.log(JSON.stringify(result, null, 2));
        });
    });
});
