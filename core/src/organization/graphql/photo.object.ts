import { Field, ObjectType } from "@nestjs/graphql";
import { Approval } from "../database/approval.entity";

@ObjectType()
export class PhotoObject {
    @Field(() => String)
    url?: string;
    
    approval: Approval;
}