import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import {Member} from "./member.entity";
import {Photo} from "./photo.entity";
import {Pronouns} from "./pronouns.entity";

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
