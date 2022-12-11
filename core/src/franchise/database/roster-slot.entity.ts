import {Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import {Player} from "./player.entity";
import {RosterRole} from "./roster-role.entity";
import {Team} from "./team.entity";

@Entity({schema: "sprocket"})
export class RosterSlot extends BaseEntity {
    @ManyToOne(() => RosterRole)
    @JoinColumn()
    role: RosterRole;

    @ManyToOne(() => Team)
    @JoinColumn()
    team: Team;

    @OneToOne(() => Player, p => p.slot)
    @JoinColumn()
    player: Player;
}
