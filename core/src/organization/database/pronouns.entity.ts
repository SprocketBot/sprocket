import {Column, Entity, ManyToOne} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import { Organization } from "./organization.entity";

@Entity({schema: "sprocket"})
export class Pronouns extends BaseEntity {
    @ManyToOne(() => Organization)
    organization: Organization;

    @Column()
    subjectPronoun: string;

    @Column()
    objectPronoun: string;

    @Column()
    possessiveAdjective: string;

    @Column()
    possessivePronoun: string;

    @Column()
    reflexivePronoun: string;
}
