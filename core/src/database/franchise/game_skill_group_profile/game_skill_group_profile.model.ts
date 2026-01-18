import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, JoinColumn, ManyToOne, OneToOne,
} from "typeorm";

import {GameSkillGroup} from "$db/franchise/game_skill_group/game_skill_group.model";
import {Photo} from "$db/organization/photo/photo.model";
import {Webhook} from "$db/webhook/webhook/webhook.model";

import {BaseModel} from "../../base-model";

@Entity({schema: "sprocket"})
@ObjectType()
export class GameSkillGroupProfile extends BaseModel {
    @Column()
    @Field(() => String)
    code: string;

    @Column()
    @Field(() => String)
    description: string;

    // Scrim Report Cards
    @ManyToOne(() => Webhook, {nullable: true})
    @Field(() => Webhook, {nullable: true})
    scrimReportCardWebhook?: Webhook;

    // League Play Report Cards
    @ManyToOne(() => Webhook, {nullable: true})
    @Field(() => Webhook, {nullable: true})
    matchReportCardWebhook?: Webhook;

    // Scrim Updates (Mostly created)
    @ManyToOne(() => Webhook, {nullable: true})
    @Field(() => Webhook, {nullable: true})
    scrimWebhook?: Webhook;

    // Role to ping on scrim creation
    @Column({nullable: true})
    @Field(() => String, {nullable: true})
    scrimDiscordRoleId?: string;

    @Column()
    @Field()
    color: string;

    @OneToOne(() => Photo,  {nullable: true})
    @JoinColumn()
    @Field(() => Photo, {nullable: true})
    photo?: Photo;

    @Column()
    @Field(() => String)
    discordEmojiId: string;

    @OneToOne(() => GameSkillGroup)
    @JoinColumn()
    @Field(() => GameSkillGroup)
    skillGroup: GameSkillGroup;

    @Column()
    skillGroupId: number;
}
