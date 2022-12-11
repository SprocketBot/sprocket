import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {Photo} from "./photo.entity";

@Injectable()
export class PhotoRepository extends ExtendedRepository<Photo> {
    constructor(readonly dataSource: DataSource) {
        super(Photo, dataSource);
    }
}
