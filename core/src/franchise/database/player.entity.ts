import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";

import {Member} from "";
import {GameSkillGroup} from "";
import {RosterSlot} from "";

import {BaseEntity} from "../../types/base-entity";

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
