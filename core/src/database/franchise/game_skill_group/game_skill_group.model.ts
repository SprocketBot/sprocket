import {Field, ObjectType} from "@nestjs/graphql";
import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {Game} from "../../game/models";
import {Organization} from "../../organization/models";
import {GameSkillGroupProfile} from "../game_skill_group_profile/game_skill_group_profile.model";
import {Player} from "../player/player.model";
import {RosterRoleUseLimits} from "../roster_role_use_limits/roster_role_use_limits.model";
import {Team} from "../team/team.model";

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

    @Column()
    organizationId: number;
}
