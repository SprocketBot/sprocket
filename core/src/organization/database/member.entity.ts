import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";

import {OrganizationStaffSeat} from "";
import {Player} from "";
import {User} from "";
import {MemberPlatformAccount} from "";
import {MemberProfile} from "";
import {MemberRestriction} from "";
import {Organization} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class Member extends BaseEntity {
    @OneToMany(() => MemberPlatformAccount, mpa => mpa.member)
    platformAccounts: MemberPlatformAccount[];

    @OneToOne(() => MemberProfile, mp => mp.member)
    profile: MemberProfile;

    @ManyToOne(() => Organization)
    @JoinColumn()
    organization: Organization;

    @OneToMany(() => Player, p => p.member)
    players: Player[];

    @ManyToOne(() => User, u => u.members)
    @JoinColumn()
    user: User;

    @OneToMany(() => MemberRestriction, mr => mr.member)
    restrictions: MemberRestriction;

    @OneToMany(() => OrganizationStaffSeat, oss => oss.member)
    organizationStaffSeats: OrganizationStaffSeat[];

    @Column()
    userId: number;

    @Column()
    organizationId: number;
}
