import {Field, Float, Int, ObjectType} from "@nestjs/graphql";

@ObjectType()
export class MlePresentationFreeAgent {
    @Field(() => Int)
    id!: number;

    @Field(() => Int)
    mleid!: number;

    @Field(() => String)
    name!: string;

    @Field(() => String, {nullable: true})
    teamName?: string;

    @Field(() => String, {nullable: true})
    league?: string;

    @Field(() => Float)
    salary!: number;

    @Field(() => String, {nullable: true})
    role?: string;

    @Field(() => Boolean)
    suspended!: boolean;
}

@ObjectType()
export class MlePresentationFaList {
    @Field(() => String)
    league!: string;

    @Field(() => [MlePresentationFreeAgent])
    players!: MlePresentationFreeAgent[];

    @Field(() => Int)
    totalCount!: number;

    @Field(() => Int)
    totalSalary!: number;
}