import {UseGuards} from "@nestjs/common";
import {Query, Resolver} from "@nestjs/graphql";

import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import {CurrentMember} from "../../authorization/decorators";
import {MemberGuard} from "../../authorization/guards";
import {PlayerRepository} from "../../franchise/database/player.repository";
import {Member} from "../../organization/database/member.entity";
import {GameConverter} from "../graphql/game.converter";
import {GameObject} from "../graphql/game.object";

@Resolver(() => GameObject)
@UseGuards(GraphQLJwtAuthGuard)
export class GameResolver {
    constructor(private readonly playerRepo: PlayerRepository, private readonly gameConverter: GameConverter) {}

    @Query(() => [GameObject])
    @UseGuards(MemberGuard)
    async getMemberGames(@CurrentMember() member: Member): Promise<GameObject[]> {
        const players = await this.playerRepo.find({
            where: {
                memberId: member.id,
            },
            relations: {
                skillGroup: {
                    game: true,
                },
            },
        });
        return Promise.all(players.map(p => p.skillGroup.game).map(g => this.gameConverter.convertGameToObject(g)));
    }
}
