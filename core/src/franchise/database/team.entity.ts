import {Column, Entity, ManyToOne} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import {Franchise} from "./franchise.entity";
import {GameSkillGroup} from "./game-skill-group.entity";

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
