import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Game} from "../../game";
import {Organization} from "../../organization";
import {GameSkillGroupProfile} from "../game_skill_group_profile";
import {Player} from "../player";
import {RosterRoleUseLimits} from "../roster_role_use_limits";
import {Team} from "../team";

@Entity({schema: "sprocket"})
@ObjectType()
export class GameSkillGroup extends BaseModel {
    @Column()
    @Field(() => Number)
    ordinal: number;

    @Column()
    @Field(() => Number)
    salaryCap: number;

    @OneToOne(() => GameSkillGroupProfile, gsgp => gsgp.skillGroup)
    @Field(() => GameSkillGroupProfile)
    profile: GameSkillGroupProfile;

    @ManyToOne(() => Game, g => g.skillGroups)
    @JoinColumn()
    @Field(() => Game)
    game: Game;

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

    @ManyToOne(() => Organization)
    @Field(() => Organization)
    organization: Organization;
}
