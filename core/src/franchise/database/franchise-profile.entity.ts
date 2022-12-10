import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";

import {Photo} from "";
import {Webhook} from "";
import {Franchise} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class FranchiseProfile extends BaseEntity {
    @Column()
    title: string;

    @Column()
    code: string;

    //Scrim Report Cards
    @ManyToOne(() => Webhook, {nullable: true})
    scrimReportCardWebhook?: Webhook;

    //League Play Report Cards
    @ManyToOne(() => Webhook, {nullable: true})
    matchReportCardWebhook?: Webhook;

    // Submissions Ready for Ratification or Failed
    @ManyToOne(() => Webhook, {nullable: true})
    submissionWebhook?: Webhook;

    @Column({nullable: true})
    submissionDiscordRoleID?: string;

    @OneToOne(() => Photo, {nullable: true})
    @JoinColumn()
    franchise: Franchise;

    @Column()
    franchiseId: number;

    @Column()
    primaryColor: string;

    @Column()
    secondaryColor: string;
}
