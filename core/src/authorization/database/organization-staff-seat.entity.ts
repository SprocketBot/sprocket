import {Entity, JoinColumn, ManyToOne} from "typeorm";

import {Member} from "../../organization/database/member.entity";
import {BaseEntity} from "../../types/base-entity";
import {OrganizationStaffPosition} from "./organization-staff-position.entity";

@Entity({schema: "sprocket"})
export class OrganizationStaffSeat extends BaseEntity {
    @ManyToOne(() => Member, {nullable: true})
    @JoinColumn()
    member?: Member;

    @ManyToOne(() => OrganizationStaffPosition)
    @JoinColumn()
    position: OrganizationStaffPosition;
}
