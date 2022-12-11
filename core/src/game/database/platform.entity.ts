import {Column, Entity, OneToMany} from "typeorm";

import {MemberPlatformAccount} from "";
import {GamePlatform} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class Platform extends BaseEntity {
    @Column()
    code: string;

    @OneToMany(() => MemberPlatformAccount, mpa => mpa.platform)
    memberAccounts: MemberPlatformAccount[];

    @OneToMany(() => GamePlatform, gp => gp.platform)
    supportedGames: GamePlatform[];
}
