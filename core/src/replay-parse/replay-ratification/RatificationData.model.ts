import {Field, ObjectType} from "@nestjs/graphql";

@ObjectType()
export class RatificationData {
    @Field(() => Number)
    requiredRatifications: number;

    @Field(() => Number)
    currentRatifications: number;
}
