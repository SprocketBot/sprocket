/* eslint-disable @typescript-eslint/member-ordering */
import {Injectable} from "@nestjs/common";
import type {
    GraphQLTypes, InputType, ValueTypes,
} from "@sprocketbot/gql-client";
import {Chain} from "@sprocketbot/gql-client";

import {config} from "../../util/config";


@Injectable()
export class GqlService {
    private chain = Chain(config.gql.url);

    async query<Z extends ValueTypes["Query"]>(q: Z | ValueTypes["Query"]): Promise<InputType<GraphQLTypes["Query"], Z>> {
        // Remove the . below if Typescript complains

        // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error,@typescript-eslint/ban-ts-comment
        // @ts-ignore Typescript thinks that "Type instantiation is excessively deep and possible infinite", but type inference still works
        return this.chain("query")(q);
    }

    async mutation<Z extends ValueTypes["Mutation"]>(m: Z | ValueTypes["Mutation"]): Promise<InputType<GraphQLTypes["Mutation"], Z>> {
        // Remove the . below if Typescript complains

        // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error,@typescript-eslint/ban-ts-comment
        // @ts-ignore Typescript thinks that "Type instantiation is excessively deep and possible infinite", but type inference still works
        return this.chain("mutation")(m);
    }

}

export * from "@sprocketbot/gql-client";
