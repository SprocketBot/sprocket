import {Injectable} from "@nestjs/common";
import {InjectConnection, InjectRepository} from "@nestjs/typeorm";
import {
    config,
    ImageGenerationEndpoint, ImageGenerationService as IGService, ResponseStatus,
} from "@sprocketbot/common";
import {Connection, Repository} from "typeorm";

import {ImageTemplate} from "../database";

@Injectable()
export class ImageGenerationService {
    constructor(
        @InjectRepository(ImageTemplate) private imageTemplateRepository: Repository<ImageTemplate>,
        @InjectConnection() private readonly connection: Connection,
        private igService: IGService,
    ) {}

    async createScrimReportCard(scrimId: number): Promise<string> {
        const reportCardRow = await this.imageTemplateRepository.findOneOrFail({where: {reportCode: "scrim_report_cards"} });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = await this.connection.query(reportCardRow.query.query, [scrimId, config.defaultOrganizationId]);
        const result = await this.igService.send(
            ImageGenerationEndpoint.GenerateImage,
            {
                inputFile: `scrim_report_cards/scrimReportCards2/template.svg`,
                outputFile: `scrim_report_cards/scrimReportCards2/outputs/${scrimId}_1`,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                template: data[0].data,
            },
        );
        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async createMatchReportCard(seriesId: number): Promise<string> {
        const reportCardRow = await this.imageTemplateRepository.findOneOrFail({where: {reportCode: "series_report_cards"} });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = await this.connection.query(reportCardRow.query.query, [seriesId, config.defaultOrganizationId]);
        const result = await this.igService.send(
            ImageGenerationEndpoint.GenerateImage,
            {
                inputFile: `series_report_cards/seriesSixPlayersMax/template.svg`,
                outputFile: `series_report_cards/seriesSixPlayersMax/outputs/${seriesId}_1`,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                template: data[0].data,
            },
        );
        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }
}
