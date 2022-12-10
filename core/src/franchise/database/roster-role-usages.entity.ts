import {Entity, ManyToOne} from "typeorm";

import {Match} from "";
import {Player} from "";
import {RosterRole} from "";
import {Team} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class RosterRoleUsage extends BaseEntity {
    @ManyToOne(() => Team)
    team: Team;

    @ManyToOne(() => Player)
    player: Player;

    @ManyToOne(() => RosterRole)
    rosterRole: RosterRole;

    @ManyToOne(() => Match)
    match: Match;
}
