import {Field, ObjectType} from "@nestjs/graphql";

@ObjectType()
export class ImageTemplateQueryFilters {
    @Field()
    name: string;

    @Field()
    description: string;

    @Field()
    code: string;

    @Field()
    query: string;
}
