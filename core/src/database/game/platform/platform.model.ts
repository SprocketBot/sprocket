import {Field, ObjectType} from "@nestjs/graphql";
import {
    Entity, ManyToMany, OneToMany,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {MemberPlatformAccount} from "../../organization/member_platform_account";
import {Game} from "../game";

@Entity({schema: "sprocket"})
@ObjectType()
export class Platform extends BaseModel {
    @OneToMany(() => MemberPlatformAccount, mpa => mpa.platform)
    @Field(() => [MemberPlatformAccount])
    memberAccounts: MemberPlatformAccount[];

    @ManyToMany(() => Game)
    @Field(() => [Game])
    supportedGames: Game[];
}
