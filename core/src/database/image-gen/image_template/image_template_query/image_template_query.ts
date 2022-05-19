import {Field, ObjectType} from "@nestjs/graphql";

import {ImageTemplateQueryFilters} from "./image_template_query_filters";

@ObjectType()
export class ImageTemplateQuery {
    @Field()
    query: string;

    @Field(() => ImageTemplateQueryFilters)
    filters: ImageTemplateQueryFilters;
}
