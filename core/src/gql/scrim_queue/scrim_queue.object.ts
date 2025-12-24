import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { QueueStatus, ScrimQueueEntity } from '../../db/scrim_queue/scrim_queue.entity';
import { PlayerObject } from '../player/player.object';
import { GameObject } from '../game/game.object';
import { MatchObject } from '../match/match.object';

registerEnumType(QueueStatus, { name: 'QueueStatus' });

@ObjectType('ScrimQueue')
export class ScrimQueueObject {
    @Field()
    id: string;

    @Field(() => PlayerObject)
    player: PlayerObject;

    @Field(() => GameObject)
    game: GameObject;

    @Field(() => Int)
    skillRating: number;

    @Field()
    queuedAt: Date;

    @Field(() => QueueStatus)
    status: QueueStatus;

    @Field({ nullable: true })
    matchedAt?: Date;

    @Field(() => MatchObject, { nullable: true })
    match?: MatchObject;
}
