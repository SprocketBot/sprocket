import {Column, Entity, JoinColumn, ManyToOne, Unique} from "typeorm";

import {Platform} from "../../game/database/platform.entity";
import {BaseEntity} from "../../types/base-entity";
import {Member} from "./member.entity";

@Entity({schema: "sprocket"})
@Unique(["platform", "platformAccountId"])
export class MemberPlatformAccount extends BaseEntity {
    @ManyToOne(() => Member)
    @JoinColumn()
    member: Member;

    @Column()
    memberId: number;

    @ManyToOne(() => Platform)
    @JoinColumn()
    platform: Platform;

    @Column()
    platformId: number;

    @Column()
    platformAccountId: string;
}
