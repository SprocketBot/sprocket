import {Entity, OneToMany, OneToOne} from "typeorm";

import {Member} from "";
import {UserAuthenticationAccount} from "";
import {UserProfile} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class User extends BaseEntity {
    @OneToMany(() => UserAuthenticationAccount, uaa => uaa.user)
    authenticationAccounts: UserAuthenticationAccount[];

    @OneToOne(() => UserProfile, profile => profile.user)
    profile: UserProfile;

    @OneToMany(() => Member, m => m.user)
    members: Member[];
}
