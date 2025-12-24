import { Field, ObjectType } from '@nestjs/graphql';
import { ScrimTimeoutEntity } from '../../db/scrim_timeout/scrim_timeout.entity';
import { PlayerObject } from '../player/player.object';

@ObjectType('ScrimTimeout')
export class ScrimTimeoutObject {
    @Field()
    id: string;

    @Field(() => PlayerObject)
    player: PlayerObject;

    @Field()
    expiresAt: Date;

    @Field()
    reason: string;
}
