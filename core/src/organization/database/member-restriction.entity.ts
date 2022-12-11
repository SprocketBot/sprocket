import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";

import {Member} from "";
import {MemberRestrictionType} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class MemberRestriction extends BaseEntity {
    @Column({
        type: "enum",
        enum: MemberRestrictionType,
    })
    type: MemberRestrictionType;

    @Column()
    expiration: Date;

    @Column()
    reason: string;

    @Column({nullable: true})
    manualExpiration?: Date;

    @Column({nullable: true})
    manualExpirationReason?: string;

    @Column({default: false})
    forgiven: boolean;

    @ManyToOne(() => Member, m => m.restrictions)
    @JoinColumn()
    member: Member;

    @Column()
    memberId: number;
}
