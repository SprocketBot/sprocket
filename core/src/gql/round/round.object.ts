import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { RoundEntity } from '../../db/round/round.entity';
import { MatchObject } from '../match/match.object';
import { PlayerStatObject } from '../player_stat/player_stat.object';
import { TeamStatObject } from '../team_stat/team_stat.object';

@ObjectType('Round')
export class RoundObject extends BaseObject {
    @Field(() => MatchObject)
    match: any;

    @Field(() => Int)
    roundNumber: number;

    @Field()
    isMapCheck: boolean;

    @Field(() => String, { defaultValue: '{}' })
    metadata: string;

    @Field(() => [PlayerStatObject])
    playerStats: any[];

    @Field(() => [TeamStatObject])
    teamStats: any[];
}
