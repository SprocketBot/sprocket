import {Column, Entity, ManyToOne} from "typeorm";

import {Organization} from "";

import {BaseEntity} from "../../types/base-entity";

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
