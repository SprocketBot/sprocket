import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, ManyToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {Member} from "../../organization/member";
import {OrganizationStaffPosition} from "../organization_staff_position";
@Entity()
@ObjectType()
export class OrganizationStaffSeat extends BaseModel {
    @ManyToOne(() => Member, {nullable: true})
    @Field(() => Member, {nullable: true})
    member?: Member;

    @ManyToOne(() => OrganizationStaffPosition)
    @Field(() => OrganizationStaffPosition)
    position: OrganizationStaffPosition;
}
