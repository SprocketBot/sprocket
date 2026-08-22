import {Field, Int, ObjectType} from "@nestjs/graphql";
import {ReportCardAssetType} from "@sprocketbot/common";
import {Column, Entity, Index} from "typeorm";

import {BaseModel} from "../base-model";

@Index("report_card_asset_type_sprocket_id_unique", ["type", "sprocketId"], {unique: true})
@Entity({schema: "sprocket"})
@ObjectType()
export class ReportCardAsset extends BaseModel {
    @Column({type: "enum", enum: ReportCardAssetType})
    @Field(() => String)
  type: ReportCardAssetType;

    @Column({type: "int"})
    @Field(() => Int)
  sprocketId: number;

    @Column({type: "int"})
    @Field(() => Int)
  legacyId: number;

    @Column({type: "int"})
    @Field(() => Int)
  organizationId: number;

    @Column({type: "varchar"})
    @Field(() => String)
  minioKey: string;

    @Column({type: "uuid", nullable: true})
    @Field(() => String, {nullable: true})
  scrimUuid?: string | null;

    @Column({type: "int", array: true, default: () => "'{}'"})
    @Field(() => [Int])
  userIds: number[];

    @Column({type: "int", array: true, default: () => "'{}'"})
    @Field(() => [Int])
  franchiseIds: number[];
}
