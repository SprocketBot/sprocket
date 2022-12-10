import {Column, Entity, ManyToOne} from "typeorm";

import {Game} from "";
import {Organization} from "";
import {GameSkillGroup} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class RosterRole extends BaseEntity {
    @Column()
    code: string;

    @Column()
    description: string;

    @ManyToOne(() => Game)
    game: Game;

    @ManyToOne(() => GameSkillGroup)
    skillGroup: GameSkillGroup;

    @ManyToOne(() => Organization)
    organization: Organization;
}
