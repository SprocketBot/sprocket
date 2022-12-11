import {Column, Entity, JoinColumn, OneToOne} from "typeorm";

import {Approval} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class Photo extends BaseEntity {
    @Column({nullable: true})
    url?: string;

    @OneToOne(() => Approval)
    @JoinColumn()
    approval: Approval;
}
