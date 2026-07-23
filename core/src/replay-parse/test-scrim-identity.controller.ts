import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import type {CoreOutput} from "@sprocketbot/common";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import {TestScrimIdentityService} from "./test-scrim-identity.service";

@Controller("test-scrim")
export class TestScrimIdentityController {
    constructor(private readonly service: TestScrimIdentityService) {}

    @MessagePattern(CoreEndpoint.ProvisionTestReplayPlayers)
    async provision(@Payload() payload: unknown): Promise<CoreOutput<CoreEndpoint.ProvisionTestReplayPlayers>> {
        const data = CoreSchemas.ProvisionTestReplayPlayers.input.parse(payload);
        return this.service.provision(data.testRunId, data.organizationId, data.skillGroupId, data.players);
    }
}
