import {Field, ObjectType} from "@nestjs/graphql";
import {Column, Entity, OneToMany, OneToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {Member} from "../../organization";
import {UserRolesType} from "../roles/user_roles_type.enum";
import {UserAuthenticationAccount} from "../user_authentication_account";
import {UserProfile} from "../user_profile";

@Entity({schema: "sprocket"})
@ObjectType()
export class User extends BaseModel {
    @OneToMany(() => UserAuthenticationAccount, uaa => uaa.user)
    @Field(() => [UserAuthenticationAccount])
    authenticationAccounts: UserAuthenticationAccount[];

    @OneToOne(() => UserProfile, profile => profile.user)
    @Field(() => UserProfile)
    profile: UserProfile;

    @Column({
        name: "type",
        type: "enum",
        enum: UserRolesType,
        array: true,
        nullable: true,
    })
    type: UserRolesType[];

    @OneToMany(() => Member, m => m.user)
    @Field(() => [Member])
    members: Member[];
}
