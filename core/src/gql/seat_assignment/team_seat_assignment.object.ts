import { Field, ObjectType } from '@nestjs/graphql';
import { TeamObject } from '../team/team.object';
import { BaseSeatAssignmentObject } from './base_seat_assignment.object';

@ObjectType('TeamSeatAssignment')
export class TeamSeatAssignmentObject extends BaseSeatAssignmentObject {
	@Field(() => TeamObject)
	team: TeamObject;
}
