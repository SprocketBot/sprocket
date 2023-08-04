import { Field, ObjectType, Int} from "@nestjs/graphql";
import { ScheduleGroupObject } from "./schedule-group.object";
import { Organization } from "../../../organization/database/organization.entity";

@ObjectType()
export class ScheduleGroupTypeObject {
    @Field(() => Int)
    id: number;

    @Field(() => Date)
    createdAt: Date | undefined;

    @Field(() => Date)
    updatedAt?: Date | undefined;

    organization: Organization;
    
    @Field(() => Int)
    organizationId: number;

    @Field(() => String)
    name: string;

    @Field(() => String)
    code: string;

    @Field(() => ScheduleGroupObject)
    scheduleGroups: ScheduleGroupObject[];
}
