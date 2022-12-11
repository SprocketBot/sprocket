import {Column, Entity} from "typeorm";

import {ImageTemplateQuery} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class ImageTemplate extends BaseEntity {
    @Column({type: "jsonb"})
    templateStructure: unknown;

    @Column()
    reportCode: string;

    @Column()
    displayName: string;

    @Column()
    description: string;

    @Column({type: "jsonb"})
    query: ImageTemplateQuery;
}
