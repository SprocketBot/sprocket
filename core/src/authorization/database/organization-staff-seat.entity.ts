import {Entity, JoinColumn, ManyToOne} from "typeorm";

import {Member} from "";
import {OrganizationStaffPosition} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class OrganizationStaffSeat extends BaseEntity {
    @ManyToOne(() => Member, {nullable: true})
    @JoinColumn()
    member?: Member;

    @ManyToOne(() => OrganizationStaffPosition)
    @JoinColumn()
    position: OrganizationStaffPosition;
}
