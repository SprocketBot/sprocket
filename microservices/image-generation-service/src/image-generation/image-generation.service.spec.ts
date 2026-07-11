import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";
import {MinioService} from "@sprocketbot/common";

import {ImageGenerationService} from "./image-generation.service";
import {SvgTransformationService} from "./svg-transformation/svg-transformation.service";

describe("ImageGenerationService", () => {
    let service: ImageGenerationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ImageGenerationService,
                {
                    provide: MinioService,
                    useValue: {},
                },
                {
                    provide: SvgTransformationService,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<ImageGenerationService>(ImageGenerationService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
