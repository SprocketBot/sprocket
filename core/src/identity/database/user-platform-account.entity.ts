import {Column, Entity, JoinColumn, ManyToOne, Unique} from "typeorm";

import {Platform} from "../../game/database/platform.entity";
import {BaseEntity} from "../../types/base-entity";
import {User} from "./user.entity";

@Entity({schema: "sprocket"})
@Unique(["platform", "platformAccountId"])
export class UserPlatformAccount extends BaseEntity {
    @ManyToOne(() => User)
    @JoinColumn()
    user: User;

    @Column()
    userId: number;

    @ManyToOne(() => Platform)
    @JoinColumn()
    platform: Platform;

    @Column()
    platformId: number;

    @Column()
    platformAccountId: string;
}
