import {Field, Int, ObjectType} from "@nestjs/graphql";
import {
    CreateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

import type {IrrelevantFields} from ".";

@ObjectType()
export class BaseModel {
    @PrimaryGeneratedColumn()
    @Field(() => Int)
    id: number;

    @CreateDateColumn()
    @Field(() => Date)
    createdAt: Date;

    @UpdateDateColumn()
    @Field(() => Date, {nullable: true})
    updatedAt: Date;

    @DeleteDateColumn()
    @Field(() => Date, {nullable: true})
    deletedAt: Date;
}

export type ModelLifecycleFields = "createdAt" | "updatedAt" | "deletedAt";

export type BaseModelCore = Omit<BaseModel, IrrelevantFields>;
