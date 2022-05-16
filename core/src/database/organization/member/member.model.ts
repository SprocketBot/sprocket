import {Field, ObjectType} from "@nestjs/graphql";
import {
    Entity, JoinColumn, ManyToOne, OneToMany, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Player} from "../../franchise/player/player.model";
import {User} from "../../identity/user/user.model";
import {MemberPlatformAccount} from "../member_platform_account";
import {MemberProfile} from "../member_profile";
import {MemberRestriction} from "../member_restriction";
import {Organization} from "../organization";

@Entity({schema: "sprocket"})
@ObjectType()
export class Member extends BaseModel {
    @OneToMany(() => MemberPlatformAccount, mpa => mpa.member)
    @Field(() => [MemberPlatformAccount])
    platformAccounts: MemberPlatformAccount[];

    @OneToOne(() => MemberProfile)
    @JoinColumn()
    @Field(() => MemberProfile)
    profile: MemberProfile;

    @ManyToOne(() => Organization)
    @Field(() => Organization)
    organization: Organization;

    @OneToMany(() => Player, p => p.member)
    @Field(() => [Player])
    players: Player[];

    @ManyToOne(() => User, u => u.members)
    @Field(() => User)
    user: User;

    @OneToMany(() => MemberRestriction, mr => mr.member)
    @Field(() => [MemberRestriction])
    restrictions: MemberRestriction;
}
