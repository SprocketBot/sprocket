import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";

import {Photo} from "../../organization/database/photo.entity";
import {BaseEntity} from "../../types/base-entity";
import {Webhook} from "../../webhook/database/webhook.entity";
import {Franchise} from "./franchise.entity";

@Entity({schema: "sprocket"})
export class FranchiseProfile extends BaseEntity {
    @Column()
    title: string;

    @Column()
    code: string;

    // Scrim Report Cards
    @ManyToOne(() => Webhook, {nullable: true})
    scrimReportCardWebhook?: Webhook;

    // League Play Report Cards
    @ManyToOne(() => Webhook, {nullable: true})
    matchReportCardWebhook?: Webhook;

    // Submissions Ready for Ratification or Failed
    @ManyToOne(() => Webhook, {nullable: true})
    submissionWebhook?: Webhook;

    @Column({nullable: true})
    submissionDiscordRoleId?: string;

    @OneToOne(() => Photo, {nullable: true})
    @JoinColumn()
    photo?: Photo;

    @OneToOne(() => Franchise)
    @JoinColumn()
    franchise: Franchise;

    @Column()
    franchiseId: number;

    @Column()
    primaryColor: string;

    @Column()
    secondaryColor: string;
}
