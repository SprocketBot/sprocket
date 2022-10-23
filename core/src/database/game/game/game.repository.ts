import {Injectable} from "@nestjs/common";
import type {FindOneOptions} from "typeorm";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {Game} from "./game.model";

@Injectable()
export class GameRepository extends ExtendedRepository<Game> {
    constructor(readonly dataSource: DataSource) {
        super(Game, dataSource);
    }

    async getByTitle(title: string, options?: FindOneOptions<Game>): Promise<Game> {
        return this.findOneOrFail(Object.assign({where: {title}}, options));
    }
}
