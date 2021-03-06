import {Field, ObjectType} from "@nestjs/graphql/dist";
import {
    Column, Entity, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Organization} from "../organization/organization.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class OrganizationProfile extends BaseModel {
    @Column()
    @Field(() => String)
    name: string;

    @Column()
    @Field(() => String)
    description: string;

    @OneToOne(() => Organization)
    @Field(() => Organization)
    organization: Organization;

    @Column({default: ""})
    @Field(() => String)
    websiteUrl: string;

    @Column()
    @Field(() => String)
    primaryColor: string;

    @Column()
    @Field(() => String)
    secondaryColor: string;

    @Column({nullable: true})
    @Field(() => String, {nullable: true})
    logoUrl?: string;
}
