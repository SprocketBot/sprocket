import { Field, ObjectType } from "@nestjs/graphql";
import { MatchParentObject } from "./match-parent.object";

@ObjectType()
export class ScrimMetaObject {
    @Field(() => MatchParentObject)
    parent: MatchParentObject;
}