import {Entity, OneToMany, OneToOne} from "typeorm";

import {Member} from "../../organization/database/member.entity";
import {BaseEntity} from "../../types/base-entity";
import {UserAuthenticationAccount} from "./user-authentication-account.entity";
import {UserProfile} from "./user-profile.entity";

@Entity({schema: "sprocket"})
export class User extends BaseEntity {
    @OneToMany(() => UserAuthenticationAccount, uaa => uaa.user)
    authenticationAccounts: UserAuthenticationAccount[];

    @OneToOne(() => UserProfile, profile => profile.user)
    profile: UserProfile;

    @OneToMany(() => Member, m => m.user)
    members: Member[];
}
