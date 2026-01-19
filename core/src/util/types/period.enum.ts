import { registerEnumType } from '@nestjs/graphql';

export enum Period {
  HOUR = 'HOUR',
  DAY = 'DAY',
}
registerEnumType(Period, { name: 'Period' });
