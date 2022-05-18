import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column,
    Entity, ManyToMany, OneToMany,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {MemberPlatformAccount} from "../../organization/member_platform_account";
import {Game} from "../game";

@Entity({schema: "sprocket"})
@ObjectType()
export class Platform extends BaseModel {
    @Column()
    @Field()
    code: string;

    @OneToMany(() => MemberPlatformAccount, mpa => mpa.platform)
    @Field(() => [MemberPlatformAccount])
    memberAccounts: MemberPlatformAccount[];

    @ManyToMany(() => Game)
    @Field(() => [Game])
    supportedGames: Game[];
}
