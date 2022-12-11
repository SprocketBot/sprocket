import {Column, Entity, JoinColumn, OneToOne} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import {User} from "./user.entity";

@Entity({schema: "sprocket"})
export class UserProfile extends BaseEntity {
    @Column()
    email: string;

    @Column({default: "Sprocket User"})
    displayName: string;

    @Column({nullable: true})
    firstName?: string;

    @Column({nullable: true})
    lastName?: string;

    @Column({nullable: true})
    description?: string;

    @OneToOne(() => User, user => user.profile)
    @JoinColumn()
    user: User;

    @Column()
    userId: number;
}
