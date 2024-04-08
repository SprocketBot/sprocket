import { InputType } from '@nestjs/graphql';

@InputType()
export class Pagination {}

export interface Paginated {
  page: Pagination;
}
