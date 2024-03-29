import {Column, Entity, ManyToOne} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import {Member} from "./member.entity";

@Entity({schema: "sprocket"})
export class Approval extends BaseEntity {
    @Column()
    notes: string;

    @Column({default: false})
    isApproved: boolean;

    @ManyToOne(() => Member, {nullable: true})
    approvedBy?: Member;
}
