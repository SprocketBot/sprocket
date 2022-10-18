import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, ManyToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {Member} from "../../organization/models";
import {OrganizationStaffPosition} from "../organization_staff_position/organization_staff_position.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class OrganizationStaffSeat extends BaseModel {
    @ManyToOne(() => Member, {nullable: true})
    @Field(() => Member, {nullable: true})
    member?: Member;

    @ManyToOne(() => OrganizationStaffPosition)
    @Field(() => OrganizationStaffPosition)
    position: OrganizationStaffPosition;
}
