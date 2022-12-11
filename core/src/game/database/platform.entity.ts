import {Column, Entity, OneToMany} from "typeorm";

import {MemberPlatformAccount} from "../../organization/database/member-platform-account.entity";
import {BaseEntity} from "../../types/base-entity";
import {GamePlatform} from "./game-platform.entity";

@Entity({schema: "sprocket"})
export class Platform extends BaseEntity {
    @Column()
    code: string;

    @OneToMany(() => MemberPlatformAccount, mpa => mpa.platform)
    memberAccounts: MemberPlatformAccount[];

    @OneToMany(() => GamePlatform, gp => gp.platform)
    supportedGames: GamePlatform[];
}
