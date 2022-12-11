import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";

import {Photo} from "../../organization/database/photo.entity";
import {BaseEntity} from "../../types/base-entity";
import {Webhook} from "../../webhook/database/webhook.entity";
import {GameSkillGroup} from "./game-skill-group.entity";

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
