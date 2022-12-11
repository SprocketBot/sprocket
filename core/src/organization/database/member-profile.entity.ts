import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";

import {Member} from "";
import {Photo} from "";
import {Pronouns} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class MemberProfile extends BaseEntity {
    @Column()
    name: string;

    @ManyToOne(() => Pronouns, {nullable: true})
    @JoinColumn()
    pronouns?: Pronouns;

    @OneToOne(() => Photo, {nullable: true})
    @JoinColumn()
    profilePicture?: Photo;

    @OneToOne(() => Member)
    @JoinColumn()
    member: Member;
}
