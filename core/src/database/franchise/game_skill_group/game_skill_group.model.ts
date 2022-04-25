import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, JoinColumn, OneToMany, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {GameSkillGroupProfile} from "../game_skill_group_profile";
import {Player} from "../player";
import {RosterRoleUseLimits} from "../roster_role_use_limits";
import {Team} from "../team";
@Entity()
@ObjectType()
export class GameSkillGroup extends BaseModel {
    @Column()
    @Field(() => String)
    code: string;

    @Column()
    @Field(() => String)
    description: string;

    @Column()
    @Field(() => Number)
    ordinal: number;

    @Column()
    @Field(() => Number)
    salaryCap: number;

    @OneToOne(() => GameSkillGroupProfile)
    @JoinColumn()
    @Field(() => GameSkillGroupProfile)
    profile: GameSkillGroupProfile;

    @OneToOne(() => RosterRoleUseLimits)
    @JoinColumn()
    @Field(() => RosterRoleUseLimits)
    roleUseLimits: RosterRoleUseLimits;

    @OneToMany(() => Player, p => p.skillGroup)
    @Field(() => [Player])
    players: Player[];

    @OneToMany(() => Team, t => t.skillGroup)
    @Field(() => [Team])
    teams: Team[];
}
