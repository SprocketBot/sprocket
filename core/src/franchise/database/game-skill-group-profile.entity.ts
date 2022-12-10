import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";

import {Photo} from "";
import {Webhook} from "";
import {GameSkillGroup} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class GameSkillGroupProfile extends BaseEntity {
    @Column()
    code: string;

    @Column()
    description: string;

    // Scrim Report Cards
    @ManyToOne(() => Webhook, {nullable: true})
    scrimReportCardWebhook?: Webhook;

    // League Play Report Cards
    @ManyToOne(() => Webhook, {nullable: true})
    matchReportCardWebhook?: Webhook;

    // Scrim Updates (Mostly created)
    @ManyToOne(() => Webhook, {nullable: true})
    scrimWebhook?: Webhook;

    // Role to ping on scrim creation
    @Column({nullable: true})
    scrimDiscordRoleId?: string;

    @Column()
    color: string;

    @OneToOne(() => Photo, {nullable: true})
    @JoinColumn()
    photo?: Photo;

    @Column()
    discordEmojiId: string;

    @OneToOne(() => GameSkillGroup)
    @JoinColumn()
    skillGroup: GameSkillGroup;

    @Column()
    skillGroupId: number;
}
