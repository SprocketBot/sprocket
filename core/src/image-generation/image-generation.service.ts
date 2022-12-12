import {Injectable, Logger} from "@nestjs/common";
import {
    config,
    ImageGenerationEndpoint,
    ImageGenerationService as IGService,
    ResponseStatus,
} from "@sprocketbot/common";
import {DataSource} from "typeorm";

import {ImageTemplateRepository} from "./database/image-template.repository";
import {ImageTemplateQuerySchema} from "./schemas/image-generation-query.schema";

@Injectable()
export class ImageGenerationService {
    private readonly logger = new Logger(ImageGenerationService.name);

    constructor(
        private readonly imageTemplateRepository: ImageTemplateRepository,
        private readonly dataSource: DataSource,
        private readonly igService: IGService,
    ) {}

    async createScrimReportCard(scrimId: number): Promise<string> {
        this.logger.log("Creating Scrim Report Card");
        const reportCardTemplate = await this.imageTemplateRepository.findOneOrFail({
            where: {reportCode: "scrim_report_cards"},
        });

        const reportCardRowResult = ImageTemplateQuerySchema.safeParse(reportCardTemplate.query);
        if (!reportCardRowResult.success) throw new Error("Failed to parse report card row from database");
        const reportCardRow = reportCardRowResult.data;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = await this.dataSource.query(reportCardRow.query, [scrimId, config.defaultOrganizationId]);
        const result = await this.igService.send(ImageGenerationEndpoint.GenerateImage, {
            inputFile: `scrim_report_cards/scrimReportCards2/template.svg`,
            outputFile: `scrim_report_cards/scrimReportCards2/outputs/${scrimId}_1`,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            template: data[0].data,
        });
        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async createSeriesReportCard(seriesId: number): Promise<string> {
        this.logger.log("Creating Series Report Card");
        const reportCardTemplate = await this.imageTemplateRepository.findOneOrFail({
            where: {reportCode: "series_report_cards"},
        });

        const reportCardRowResult = ImageTemplateQuerySchema.safeParse(reportCardTemplate.query);
        if (!reportCardRowResult.success) throw new Error("Failed to parse report card row from database");
        const reportCardRow = reportCardRowResult.data;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = await this.dataSource.query(reportCardRow.query, [seriesId, config.defaultOrganizationId]);

        let reportCard = "seriesSixPlayersMax";

        // if more than 6 players, use 8 player report card
        const seventhPlayer = data?.[0]?.data?.player_data?.[6]?.name as
            | {
                  value?: string;
              }
            | undefined;

        // seventh player will always exist, but its value will only be emplty of no subs were used
        if (seventhPlayer && seventhPlayer.value !== "") {
            reportCard = "seriesEightPlayersMax";
            this.logger.log("using 8 player card");
        }

        const result = await this.igService.send(ImageGenerationEndpoint.GenerateImage, {
            inputFile: `series_report_cards/${reportCard}/template.svg`,
            outputFile: `series_report_cards/${reportCard}/outputs/${seriesId}_1`,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            template: data[0].data,
        });
        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }
}
