import {Args, Int, Mutation, Resolver} from "@nestjs/graphql";

import {ImageGenerationService} from "./image-generation.service";

@Resolver()
export class ImageGenerationResolver {
    constructor(private imageGenerationService: ImageGenerationService) {}

    @Mutation(() => String)
    async generateScrimReportCard(@Args("scrimId", {type: () => Int}) scrimId: number): Promise<string> {
        return this.imageGenerationService.createScrimReportCard(scrimId);
    }

    @Mutation(() => String)
    async generateSeriesReportCard(@Args("seriesId", {type: () => Int}) seriesId: number): Promise<string> {
        return this.imageGenerationService.createSeriesReportCard(seriesId);
    }
}
