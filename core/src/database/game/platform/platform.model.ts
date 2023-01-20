import {Field, ObjectType} from "@nestjs/graphql";
import {Column, Entity, OneToMany} from "typeorm";

import {BaseModel} from "../../base-model";
import {MemberPlatformAccount} from "../../organization/models";
import {GamePlatform} from "../game_platform/game_platform.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class Platform extends BaseModel {
    @Column()
    @Field()
    code: string;

    @OneToMany(() => MemberPlatformAccount, mpa => mpa.platform)
    @Field(() => [MemberPlatformAccount])
    memberAccounts: MemberPlatformAccount[];

    @OneToMany(() => GamePlatform, gp => gp.platform)
    @Field(() => [GamePlatform])
    supportedGames: GamePlatform[];
}
