import {Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";

import {Player} from "";
import {RosterRole} from "";
import {Team} from "";

import {BaseEntity} from "../../types/base-entity";

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
