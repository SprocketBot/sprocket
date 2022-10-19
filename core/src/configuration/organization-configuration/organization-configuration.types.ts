import {Field, ObjectType} from "@nestjs/graphql";

import {Organization,OrganizationConfigurationAllowedValue} from "$models";

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
