import {Field, ObjectType} from "@nestjs/graphql/dist";
import {
    Column, Entity, JoinColumn, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {User} from "../user/user.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class UserProfile extends BaseModel {
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

    @Column({default: 0})
    @Field(() => Number)
  /**
   * Token version - incremented to invalidate all active sessions.
   * When this value changes, all existing tokens become invalid.
   */
  tokenVersion: number;

    @OneToOne(() => User, user => user.profile)
    @JoinColumn()
    @Field(() => User)
  user: User;
}
