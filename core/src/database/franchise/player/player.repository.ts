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
        options?: Omit<FindOneOptions<Player>, "where">,
    ): Promise<Player> {
        return this.get(
            Object.assign(
                {
                    relations: {
                        member: true,
                        skillGroup: true,
                    },
                },
                options,
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
                },
            ),
        );
    }
}
