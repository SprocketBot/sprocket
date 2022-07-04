import {Field, ObjectType} from "@nestjs/graphql/dist";
import {
    Column, Entity, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {User} from "../user/user.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class UserProfile extends BaseModel {
    @OneToOne(() => User, user => user.userProfile)
    @Field(() => User)
    user: User;

    @Column()
    @Field(() => String)
    email: string;

    @Column({default: "Sprocket User"})
    @Field(() => String)
    displayName: string;

    @Column({nullable: true})
    @Field(() => String, {nullable: true})
    firstName?: string;

    @Column({nullable: true})
    @Field(() => String, {nullable: true})
    lastName?: string;

    @Column({nullable: true})
    @Field(() => String)
    description?: string;

}
