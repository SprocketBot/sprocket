import { registerEnumType } from '@nestjs/graphql';

export enum MemberRestrictionType {
  QUEUE_BAN = 'QUEUE_BAN',
  RATIFICATION_BAN = 'RATIFICATION_BAN',
}

registerEnumType(MemberRestrictionType, {
  name: 'MemberRestrictionType',
});
