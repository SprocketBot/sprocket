import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { MatchStatus, MatchEntity } from '../../db/match/match.entity';
import { GameObject } from '../game/game.object';
import { GameModeObject } from '../game_mode/game_mode.object';
import { RoundObject } from '../round/round.object';

registerEnumType(MatchStatus, { name: 'MatchStatus' });

@ObjectType('Match')
export class MatchObject extends BaseObject {
    @Field(() => GameObject)
    game: GameObject;

    @Field(() => GameModeObject)
    gameMode: GameModeObject;

    @Field(() => [RoundObject])
    rounds: RoundObject[];

    @Field(() => MatchStatus)
    status: MatchStatus;

    @Field({ nullable: true })
    startTime?: Date;

    @Field({ nullable: true })
    endTime?: Date;
}
