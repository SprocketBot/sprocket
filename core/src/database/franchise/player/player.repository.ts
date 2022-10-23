import {Injectable} from "@nestjs/common";
import type {FindOneOptions} from "typeorm";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {Player} from "./player.model";

@Injectable()
export class PlayerRepository extends ExtendedRepository<Player> {
    constructor(readonly dataSource: DataSource) {
        super(Player, dataSource);
    }

    async getByOrganizationAndGame(
        userId: number,
        organizationId: number,
        gameId: number,
        options?: FindOneOptions<Player>,
    ): Promise<Player> {
        return this.get(
            Object.assign(
                {
                    where: {
                        member: {
                            userId,
                            organizationId,
                        },
                        skillGroup: {
                            gameId,
                        },
                    },
                    relations: {
                        member: true,
                        skillGroup: true,
                    },
                },
                options,
            ),
        );
    }
}
