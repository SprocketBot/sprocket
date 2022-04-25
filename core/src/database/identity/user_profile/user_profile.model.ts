import {Field, ObjectType} from "@nestjs/graphql/dist";
import {
    Column, Entity, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {User} from "../user/user.model";

@Entity()
@ObjectType()
export class UserProfile extends BaseModel {
    @OneToOne(() => User, user => user.userProfile)
    @Field(() => User)
    user: User;

    @Column()
    @Field(() => String)
    email: string;

    @Column()
    @Field(() => String)
    firstName: string;

    @Column()
    @Field(() => String)
    lastName: string;

    @Column({default: ""})
    @Field(() => String)
    description: string;

}
