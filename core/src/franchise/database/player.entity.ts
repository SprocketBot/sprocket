import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";

import {Member} from "../../organization/database/member.entity";
import {BaseEntity} from "../../types/base-entity";
import {GameSkillGroup} from "./game-skill-group.entity";
import {RosterSlot} from "./roster-slot.entity";

@Entity({schema: "sprocket"})
export class Player extends BaseEntity {
    @ManyToOne(() => Member, m => m.players)
    @JoinColumn()
    member: Member;

    @Column()
    memberId: number;

    @ManyToOne(() => GameSkillGroup)
    skillGroup: GameSkillGroup;

    @Column()
    skillGroupId: number;

    @Column({type: "float"})
    salary: number;

    @OneToOne(() => RosterSlot, rs => rs.player, {nullable: true})
    slot?: RosterSlot;

    franchiseName: string;

    franchisePositions: string[];
}
