import {Column, Entity, JoinColumn, OneToOne} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import { Approval } from "./approval.entity";

@Entity({schema: "sprocket"})
export class Photo extends BaseEntity {
    @Column({nullable: true})
    url?: string;

    @OneToOne(() => Approval)
    @JoinColumn()
    approval: Approval;
}
