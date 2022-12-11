import {Column, Entity, ManyToOne, Unique} from "typeorm";

import {User} from "";
import {UserAuthenticationAccountType} from "";

import {BaseEntity} from "../../types/base-entity";

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
