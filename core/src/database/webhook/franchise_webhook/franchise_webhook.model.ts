import {Field, ObjectType} from "@nestjs/graphql";
import {ChildEntity, ManyToOne} from "typeorm";

import {Franchise} from "../../franchise";
import {Webhook} from "../webhook";

@ChildEntity()
@ObjectType()
export class FranchiseWebhook extends Webhook {
    @ManyToOne(() => Franchise)
    @Field(() => Franchise)
    franchise: Franchise;
}
