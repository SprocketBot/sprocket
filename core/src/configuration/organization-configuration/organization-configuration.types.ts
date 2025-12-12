import {Field, ObjectType} from "@nestjs/graphql";

import {Organization} from '$db/organization/organization/organization.model';
import {OrganizationConfigurationAllowedValue} from '../../database';;;

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
