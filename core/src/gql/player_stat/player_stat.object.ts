import { Field, ObjectType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { PlayerStatEntity } from '../../db/player_stat/player_stat.entity';
import { PlayerObject } from '../player/player.object';
import { RoundObject } from '../round/round.object';

@ObjectType('PlayerStat')
export class PlayerStatObject extends BaseObject {
    @Field(() => PlayerObject)
    player: PlayerObject;

    @Field(() => RoundObject)
    round: any;

    @Field(() => String, { defaultValue: '{}' })
    stats: string;
}
