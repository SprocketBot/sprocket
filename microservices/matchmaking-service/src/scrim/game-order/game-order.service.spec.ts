import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";
import type {Scrim} from "@sprocketbot/common";
import {ScrimMode, ScrimStatus} from "@sprocketbot/common";

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
                gameMode: {description: "", id: 0},
                id: "",
                settings: {
                    competitive: false,
                    mode: ScrimMode.ROUND_ROBIN,
                    teamCount: 2,
                    teamSize: 3,
                },
                status: ScrimStatus.POPPED,
                players: [
                    {
                        id: 8,
                        name: "A",
                    },
                    {
                        id: 9,
                        name: "B",
                    },
                    {
                        id: 10,
                        name: "C",
                    },
                    {
                        id: 11011588,
                        name: "D",
                    },
                    {
                        id: 11010578,
                        name: "E",
                    },
                    {
                        id: 4975,
                        name: "F",
                    },
                ],
            };
            const result = service.generateGameOrder(scrim);
            // eslint-disable-next-line no-console
            console.log(JSON.stringify(result, null, 2));
        });
    });
});
