import {Entity, ManyToOne, OneToMany} from "typeorm";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class FranchiseLeadershipSeat extends BaseEntity {
    @ManyToOne(() => FranchiseLeadershipRole)
    role: FranchiseLeadershipRole;

    @OneToMany(() => FranchiseLeadershipAppointment, fla => fla.seat)
    appointments: FranchiseLeadershipAppointment[];
}
