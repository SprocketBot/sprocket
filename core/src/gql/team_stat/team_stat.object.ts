import { Field, ObjectType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { TeamStatEntity } from '../../db/team_stat/team_stat.entity';
import { TeamObject } from '../team/team.object';
import { RoundObject } from '../round/round.object';

@ObjectType('TeamStat')
export class TeamStatObject extends BaseObject {
    @Field(() => TeamObject, { nullable: true })
    team?: TeamObject;

    @Field(() => RoundObject)
    round: RoundObject;

    @Field(() => String, { defaultValue: '{}' })
    stats: string;
}
