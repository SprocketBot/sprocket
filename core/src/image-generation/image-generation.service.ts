import {Injectable} from "@nestjs/common";
import { InjectRepository, InjectConnection } from "@nestjs/typeorm";

import {Connection, Repository} from "typeorm";

import {ImageTemplate} from "../database";

@Injectable()
export class ImageGenerationService {
    constructor(
        @InjectRepository(ImageTemplate) private imageTemplateRepository: Repository<ImageTemplate>,
        @InjectConnection() private readonly connection: Connection
        )
    { }

    async createScrimReportCard(scrimId: number): Promise<string> {
        const reportCardRow = await this.imageTemplateRepository.findOneOrFail({where: {reportCode: "scrim_report_cards"} });
        
        const params = {scrim_id: 7, org_id:1}
        const result = await this.connection.query(reportCardRow.query.query, [params])
        return `hello ${reportCardRow.reportCode}, ${scrimId}, ${result}`;
    }
}
