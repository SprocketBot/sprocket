import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";
import {CoreService, MatchmakingService, MinioService} from "@sprocketbot/common";
import {mock} from "ts-mockito";

import {ReplaySubmissionModule} from "../replay-submission/replay-submission.module";
import {ReplayValidationService} from "./replay-validation.service";

describe("ReplayValidationService", () => {
    let service: ReplayValidationService;

    const coreService: CoreService = mock(CoreService);
    const matchmakingService: MatchmakingService = mock(MatchmakingService);
    const minioService: MinioService = mock(MinioService);

    beforeEach(async () => {
        // const module: TestingModule = await Test.createTestingModule({
        //     imports: [CoreModule, MatchmakingModule, MinioModule, ReplaySubmissionModule, UtilModule],
        //     providers: [ReplayValidationService],
        // }).compile();
        //     service =
        //     module.get<ReplayValidationService>(ReplayValidationService);

        service = new ReplayValidationService(coreService, matchmakingService, minioService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
