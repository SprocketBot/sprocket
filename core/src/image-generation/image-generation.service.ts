import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";

import {Repository} from "typeorm";

@Injectable()
export class RoundService {
    constructor(
        // @InjectRepository(ImageTemplate) private imageTemplateRepo: Repository<ImageTemplate>,
    ) {}

    async createScrimReportCard(scrimId: number): Promise<string> {
        //grab image-template row for report card -- currently hard coded
        //
      return "hello"
    }
}
