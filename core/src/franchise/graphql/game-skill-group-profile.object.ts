import { Field, ObjectType} from "@nestjs/graphql";

@ObjectType()
export class GameSkillGroupProfileObject {
    @Field(() => String)
    code: string;

    @Field(() => String)
    description: string;

    @Field(() => String)
    color: string;

}