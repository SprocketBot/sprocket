import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';

import { OrganizationConfigurationKey } from '$db/configuration/organization_configuration_key/organization_configuration_key.model';

import { BaseModel } from '../../base-model';

@Entity({ schema: 'sprocket' })
@ObjectType()
export class OrganizationConfigurationAllowedValue extends BaseModel {
  @Column()
  @Field(() => String)
  value: string;

  @ManyToOne(() => OrganizationConfigurationKey)
  @Field(() => OrganizationConfigurationKey)
  key: OrganizationConfigurationKey;

  @Column()
  @Field(() => Boolean)
  /**
   * Indicates if the value is a regex or literal
   */
  pattern: boolean;
}
