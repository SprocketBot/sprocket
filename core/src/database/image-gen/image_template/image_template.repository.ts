import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {ImageTemplate} from "./image_template.model";

@Injectable()
export class ImageTemplateRepository extends ExtendedRepository<ImageTemplate> {
    constructor(readonly dataSource: DataSource) {
        super(ImageTemplate, dataSource);
    }
}
