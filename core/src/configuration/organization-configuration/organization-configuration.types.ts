import {Field, ObjectType} from "@nestjs/graphql";

import {OrganizationConfigurationAllowedValue} from "$db/configuration/organization_configuration_allowed_value/organization_configuration_allowed_value.model";
import {Organization} from "$db/organization/organization/organization.model";

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
