import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {ImageTemplate} from "./image-template.entity";

@Injectable()
export class ImageTemplateRepository extends ExtendedRepository<ImageTemplate> {
    constructor(readonly dataSource: DataSource) {
        super(ImageTemplate, dataSource);
    }
}
