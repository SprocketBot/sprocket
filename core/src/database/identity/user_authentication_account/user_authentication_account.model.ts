import {Field, ObjectType} from "@nestjs/graphql";
import {Column, Entity, ManyToOne, Unique} from "typeorm";

import {BaseModel} from "../../base-model";
import {User} from "../user/user.model";
import {UserAuthenticationAccountType} from "./user_authentication_account_type.enum";

@Entity({schema: "sprocket"})
@Unique("UserAccounts", ["accountId", "accountType"])
@ObjectType()
export class UserAuthenticationAccount extends BaseModel {
    @ManyToOne(() => User)
    @Field(() => User)
    user: User;

    @Column()
    @Field(() => String)
    accountId: string;

    @Column({
        type: "enum",
        enum: UserAuthenticationAccountType,
    })
    @Field(() => UserAuthenticationAccountType)
    accountType: UserAuthenticationAccountType;

    @Column({nullable: true})
    @Field(() => String, {nullable: true})
    oauthToken?: string;
}
