import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";

import {Game} from "../../game/database/game.entity";
import {Organization} from "../../organization/database/organization.entity";
import {BaseEntity} from "../../types/base-entity";
import {GameSkillGroupProfile} from "./game-skill-group-profile.entity";
import {Player} from "./player.entity";
import {RosterRoleUseLimits} from "./roster-role-use-limits.entity";
import {Team} from "./team.entity";

@Entity({schema: "sprocket"})
export class GameSkillGroup extends BaseEntity {
    @Column()
    ordinal: number;

    @Column()
    salaryCap: number;

    @Column()
    profileId: number;

    @OneToOne(() => GameSkillGroupProfile, gsgp => gsgp.skillGroup)
    profile: GameSkillGroupProfile;

    @ManyToOne(() => Game, g => g.skillGroups)
    @JoinColumn()
    game: Game;

    @Column()
    gameId: number;

    @OneToOne(() => RosterRoleUseLimits)
    @JoinColumn()
    roleUseLimits: RosterRoleUseLimits;

    @OneToMany(() => Player, p => p.skillGroup)
    players: Player[];

    @OneToMany(() => Team, t => t.skillGroup)
    teams: Team[];

    @ManyToOne(() => Organization)
    organization: Organization;

    @Column()
    organizationId: number;
}
