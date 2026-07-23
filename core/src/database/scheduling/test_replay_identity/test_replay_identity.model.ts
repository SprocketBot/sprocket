import {Column, Entity, Index} from "typeorm";

import {BaseModel} from "../../base-model";

@Entity({schema: "sprocket"})
@Index(["testRunId", "platform", "platformAccountId"], {unique: true})
export class TestReplayIdentity extends BaseModel {
    @Column({type: "uuid", name: "test_run_id"})
    testRunId: string;

    @Column({type: "text"})
    platform: string;

    @Column({type: "text", name: "platform_account_id"})
    platformAccountId: string;

    @Column({name: "mapped_platform_account_id", type: "text"})
    mappedPlatformAccountId: string;

    @Column({name: "user_id"})
    userId: number;

    @Column({name: "player_id"})
    playerId: number;

    @Column({name: "mle_player_id"})
    mlePlayerId: number;
}
