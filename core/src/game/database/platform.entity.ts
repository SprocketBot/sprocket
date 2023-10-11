import {Column, Entity, OneToMany} from "typeorm";

import {UserPlatformAccount} from "../../identity/database/user-platform-account.entity";
import {BaseEntity} from "../../types/base-entity";
import {GamePlatform} from "./game-platform.entity";

@Entity({schema: "sprocket"})
export class Platform extends BaseEntity {
    @Column()
    code: string;

    @OneToMany(() => UserPlatformAccount, mpa => mpa.platform)
    userAccounts: UserPlatformAccount[];

    @OneToMany(() => GamePlatform, gp => gp.platform)
    supportedGames: GamePlatform[];
}
