import {Column, Entity, JoinColumn, OneToOne} from "typeorm";

import {User} from "";

import {BaseEntity} from "../../types/base-entity";

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
