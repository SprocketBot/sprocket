import {Field, Float, InputType, Int} from "@nestjs/graphql";

@InputType()
export class SimilarityOptions {
    @Field()
    query: string;

    @Field(() => Float, {nullable: true})
    threshold?: number;

    @Field(() => Int, {nullable: true})
    limit?: number;
}
