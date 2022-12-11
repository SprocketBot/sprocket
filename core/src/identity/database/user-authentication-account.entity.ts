import {Column, Entity, ManyToOne, Unique} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import {User} from "./user.entity";
import {UserAuthenticationAccountType} from "./user-authentication-account-type.enum";

@Entity({schema: "sprocket"})
@Unique("UserAccounts", ["accountId", "accountType"])
export class UserAuthenticationAccount extends BaseEntity {
    @ManyToOne(() => User)
    user: User;

    @Column()
    userId: number;

    @Column()
    accountId: string;

    @Column({
        type: "enum",
        enum: UserAuthenticationAccountType,
    })
    accountType: UserAuthenticationAccountType;

    @Column({nullable: true})
    oauthToken?: string;
}
