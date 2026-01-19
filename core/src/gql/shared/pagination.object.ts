import { Field, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

registerEnumType(SortOrder, {
    name: 'SortOrder',
});

@InputType()
export class OffsetPagination {
    @Field(() => Int, { defaultValue: 0 })
    offset: number;

    @Field(() => Int, { defaultValue: 25 })
    limit: number;
}

export function PaginatedResponse<T>(classRef: Type<T>): any {
    @ObjectType({ isAbstract: true })
    abstract class PaginatedResponseClass {
        @Field(() => [classRef], { nullable: false })
        items: T[];

        @Field(() => Int, { nullable: false })
        total: number;

        @Field(() => Int, { nullable: false })
        offset: number;

        @Field(() => Int, { nullable: false })
        limit: number;
    }
    return PaginatedResponseClass;
}
