import {Field, Int, ObjectType} from "@nestjs/graphql";

@ObjectType()
export class BaseObject {
    @Field(() => Int)
    id: number;

    @Field(() => Date)
    createdAt: Date;

    @Field(() => Date, {nullable: true})
    updatedAt: Date;

    @Field(() => Date, {nullable: true})
    deletedAt: Date;
}
