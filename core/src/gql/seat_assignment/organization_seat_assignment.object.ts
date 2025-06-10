import { ObjectType } from '@nestjs/graphql';
import { BaseSeatAssignmentObject } from './base_seat_assignment.object';

@ObjectType('OrganizationSeatAssignment')
export class OrganizationSeatAssignmentObject extends BaseSeatAssignmentObject {}
