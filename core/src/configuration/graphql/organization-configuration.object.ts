import {Field, ObjectType} from "@nestjs/graphql";

import {Organization} from "../../organization/database/organization.entity";
import {OrganizationConfigurationAllowedValue} from "../database/organization-configuration-allowed-value.entity";

@ObjectType()
export class OrganizationConfiguration {
    @Field(() => Organization)
    organization: Organization;

    @Field(() => String)
    key: string;

    @Field(() => [OrganizationConfigurationAllowedValue])
    allowedValues: OrganizationConfigurationAllowedValue[];

    @Field(() => String)
    value: string;
}
