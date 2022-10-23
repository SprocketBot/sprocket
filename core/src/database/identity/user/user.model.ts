import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, OneToMany, OneToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {Member} from "../../organization/models";
import {UserAuthenticationAccount} from "../user_authentication_account/user_authentication_account.model";
import {UserProfile} from "../user_profile/user_profile.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class User extends BaseModel {
    @OneToMany(() => UserAuthenticationAccount, uaa => uaa.user)
    @Field(() => [UserAuthenticationAccount])
    authenticationAccounts: UserAuthenticationAccount[];

    @OneToOne(() => UserProfile, profile => profile.user)
    @Field(() => UserProfile)
    profile: UserProfile;

    @OneToMany(() => Member, m => m.user)
    @Field(() => [Member])
    members: Member[];
}
