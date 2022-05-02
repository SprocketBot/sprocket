import {Column, Entity, Index, PrimaryGeneratedColumn} from "typeorm";
import {ChannelType} from "./enums/ChannelType.enum";

@Index("channel_map_pkey", ["channelType"], {unique: true})
@Entity("channel_map", {schema: "public"})
export class ChannelMap {
    @PrimaryGeneratedColumn({type: "integer", name: "channel_type"})
    channelType: ChannelType;

    @Column("character varying", {
        name: "created_by",
        length: 255,
        default: () => "'Unknown'",
    })
    createdBy: string;

    @Column("timestamp without time zone", {
        name: "created_at",
        default: () => "now()",
    })
    createdAt: Date;

    @Column("character varying", {
        name: "updated_by",
        length: 255,
        default: () => "'Unknown'",
    })
    updatedBy: string;

    @Column("timestamp without time zone", {
        name: "updated_at",
        default: () => "now()",
    })
    updatedAt: Date;

    @Column("character varying", {name: "channel_id", length: 255})
    channelId: string;
}
