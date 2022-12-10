import {Column, Entity, ManyToOne} from "typeorm";

import {Franchise} from "";
import {GameSkillGroup} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class Team extends BaseEntity {
    @ManyToOne(() => Franchise)
    franchise: Franchise;

    @Column()
    franchiseId: number;

    @ManyToOne(() => GameSkillGroup)
    skillGroup: GameSkillGroup;

    @Column()
    skillGroupId: number;
}
