import {Query, Resolver} from "@nestjs/graphql";

@Resolver(() => String)
export class UserResolver {
    @Query(() => String)
    async getThing(): Promise<string> {
        return "hello, world!";
    }
}
