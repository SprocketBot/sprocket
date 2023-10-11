import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";

import {OrganizationStaffSeat} from "../../authorization/database/organization-staff-seat.entity";
import {Player} from "../../franchise/database/player.entity";
import {User} from "../../identity/database/user.entity";
import {BaseEntity} from "../../types/base-entity";
import {MemberProfile} from "./member-profile.entity";
import {MemberRestriction} from "./member-restriction.entity";
import {Organization} from "./organization.entity";

@Entity({schema: "sprocket"})
export class Member extends BaseEntity {
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
