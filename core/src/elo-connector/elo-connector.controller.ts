import {Controller, Get} from "@nestjs/common";

import {EloConnectorService} from "./elo-connector.service";
import {TestPayload1} from "./elo-connector.test-data";

@Controller("elo-connector")
export class EloConnectorController {
    constructor(private readonly eloConnectorService: EloConnectorService) { }

    @Get("/testQueue")
    async trySalaries(): Promise<void> {
        await this.eloConnectorService.processSalaries(true);
    }

    @Get("/testSeriesProcessing")
    async trySeries(): Promise<void> {
        await this.eloConnectorService.runEloForSeries(TestPayload1, false);
    }
}
