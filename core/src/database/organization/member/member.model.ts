import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Player} from "../../franchise";
import {MemberPlatformAccount} from "../member_platform_account";
import {MemberProfile} from "../member_profile";
import {Organization} from "../organization";
@Entity()
@ObjectType()
export class Member extends BaseModel {
    @OneToMany(() => MemberPlatformAccount, mpa => mpa.member)
    @Field(() => [MemberPlatformAccount])
    platformAccounts: MemberPlatformAccount[];

    @OneToOne(() => MemberProfile)
    @JoinColumn()
    @Field(() => MemberProfile)
    profile: MemberProfile;

    @Column({unique: true})
    @Field(() => String)
    discordId: string;

    @ManyToOne(() => Organization)
    @Field(() => Organization)
    organization: Organization;

    @OneToMany(() => Player, p => p.member)
    @Field(() => [Player])
    players: Player[];
}
