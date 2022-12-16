import {Column, Entity, ManyToOne} from "typeorm";

import {Game} from "../../game/database/game.entity";
import {Organization} from "../../organization/database/organization.entity";
import {BaseEntity} from "../../types/base-entity";
import {GameSkillGroup} from "./game-skill-group.entity";

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
