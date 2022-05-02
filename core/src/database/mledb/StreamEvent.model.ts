import {Column, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn,} from "typeorm";
import {Series} from "./Series.model";
import {EventFormat} from "./enums/EventFormat";

@Index("stream_event_pkey", ["id"], {unique: true})
@Index("stream_event_series_id_unique", ["seriesId"], {unique: true})
@Entity("stream_event", {schema: "public"})
export class StreamEvent {
    @PrimaryGeneratedColumn({type: "integer", name: "id"})
    id: number;

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

    @Column("character varying", {name: "channel", length: 255})
    channel: string;

    @Column("integer", {name: "series_id", nullable: true, unique: true})
    seriesId: number | null;

    @Column("timestamp with time zone", {name: "event_time"})
    eventTime: Date;

    @Column("character varying", {name: "description", length: 255})
    description: string;

    @Column("character varying", {name: "format", length: 255})
    format: EventFormat;

    @Column("character varying", {
        name: "discord_id",
        nullable: true,
        length: 255,
    })
    discordId: string | null;

    @OneToOne(() => Series, (series) => series.streamEvent, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{name: "series_id", referencedColumnName: "id"}])
    series: Series;
}
