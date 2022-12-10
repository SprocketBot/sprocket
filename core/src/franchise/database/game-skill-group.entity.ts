import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";

import {Game} from "";
import {Organization} from "";
import {GameSkillGroupProfile} from "";
import {Player} from "";
import {RosterRoleUseLimits} from "";
import {Team} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class GameSkillGroup extends BaseEntity {
    @Column()
    ordinal: number;

    @Column()
    salaryCap: number;

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
