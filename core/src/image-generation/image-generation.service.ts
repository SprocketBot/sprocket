import {Inject, Injectable} from "@nestjs/common";
import { InjectRepository, InjectConnection } from "@nestjs/typeorm";

import {Connection, Repository} from "typeorm";
import { ImageTemplate } from "../database";
import { ImageGenerationEndpoint, ImageGenerationService as IGService, ResponseStatus } from "@sprocketbot/common";

@Injectable()
export class ImageGenerationService {
    constructor(
        @InjectRepository(ImageTemplate) private imageTemplateRepository: Repository<ImageTemplate>,
        @InjectConnection() private readonly connection: Connection,
        private igService:IGService
        )
    { }

    async createScrimReportCard(scrimId: number): Promise<string> {
        const reportCardRow = await this.imageTemplateRepository.findOneOrFail({where: {reportCode: "scrim_report_cards"} });
        
        const data = await this.connection.query(reportCardRow.query.query, [scrimId, 1])
        const result = await this.igService.send(
            ImageGenerationEndpoint.GenerateImage, 
            {
                inputFile: `scrim_report_cards/scrimReportCards/template.svg`,
                outputFile: `scrim_report_cards/scrimReportCards/outputs/${scrimId}_1`,
                template: data[0].data
            });
        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }
}
