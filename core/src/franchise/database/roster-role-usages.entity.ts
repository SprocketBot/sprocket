import {Entity, ManyToOne} from "typeorm";

import {Match} from "../../scheduling/database/match.entity";
import {BaseEntity} from "../../types/base-entity";
import {Player} from "./player.entity";
import {RosterRole} from "./roster-role.entity";
import {Team} from "./team.entity";

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
