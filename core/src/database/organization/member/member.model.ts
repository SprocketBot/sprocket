import {Field, ObjectType} from "@nestjs/graphql";
import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {Player} from "../../franchise/player/player.model";
import {User} from "../../identity/user/user.model";
import {MemberPlatformAccount} from "../member_platform_account/member_platform_account.model";
import {MemberProfile} from "../member_profile/member_profile.model";
import {MemberRestriction} from "../member_restriction/member_restriction.model";
import {Organization} from "../organization/organization.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class Member extends BaseModel {
    @OneToMany(() => MemberPlatformAccount, mpa => mpa.member)
    @Field(() => [MemberPlatformAccount])
    platformAccounts: MemberPlatformAccount[];

    @OneToOne(() => MemberProfile, mp => mp.member)
    @Field(() => MemberProfile)
    profile: MemberProfile;

    @ManyToOne(() => Organization)
    @JoinColumn()
    @Field(() => Organization)
    organization: Organization;

    @OneToMany(() => Player, p => p.member)
    @Field(() => [Player])
    players: Player[];

    @ManyToOne(() => User, u => u.members)
    @JoinColumn()
    @Field(() => User)
    user: User;

    @OneToMany(() => MemberRestriction, mr => mr.member)
    @Field(() => [MemberRestriction])
    restrictions: MemberRestriction;

    @Column()
    userId: number;

    @Column()
    organizationId: number;
}
