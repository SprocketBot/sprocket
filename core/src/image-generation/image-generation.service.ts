import {Injectable} from "@nestjs/common";
import {InjectConnection, InjectRepository} from "@nestjs/typeorm";
import {
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
    ) { }

    async createScrimReportCard(scrimId: number): Promise<string> {
        const reportCardRow = await this.imageTemplateRepository.findOneOrFail({where: {reportCode: "scrim_report_cards"} });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = await this.connection.query(reportCardRow.query.query, [scrimId, 1]);
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

    async createSeriesReportCard(seriesId: number): Promise<string> {
        const reportCardRow = await this.imageTemplateRepository.findOneOrFail({where: {reportCode: "series_report_cards"} });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = await this.connection.query(reportCardRow.query.query, [seriesId, 1]);
        //if more than 6 players, use 8 player report card



        const result = await this.igService.send(
            ImageGenerationEndpoint.GenerateImage,
            {
                inputFile: `scrim_report_cards/scrimReportCards2/template.svg`,
                outputFile: `scrim_report_cards/scrimReportCards2/outputs/${seriesId}_1`,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                template: data[0].data,
            },
        );
        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }
}
