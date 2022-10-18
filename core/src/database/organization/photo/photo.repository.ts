import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories";
import {Photo} from "./photo.model";

@Injectable()
export class PhotoRepository extends ExtendedRepository<Photo> {
    constructor(readonly dataSource: DataSource) {
        super(Photo, dataSource);
    }
}
