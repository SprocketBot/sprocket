import type {CanActivate, ExecutionContext} from "@nestjs/common";
import {Injectable} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";
import {InjectRepository} from "@nestjs/typeorm";
import {GraphQLError} from "graphql";
import {Repository} from "typeorm";

import {FranchiseStaffAppointment} from "../../database/franchise/franchise_staff_appointment/franchise_staff_appointment.model";
import {Member} from "../../database/organization/member/member.model";
import {Match} from "../../database/scheduling/match/match.model";
import {MatchParent} from "../../database/scheduling/match_parent/match_parent.model";
import type {UserPayload} from "../../identity";
import {PopulateService} from "../../util/populate/populate.service";

/**
 * Guard that checks if the user is franchise staff for either franchise in a match's fixture.
 * Used to allow franchise staff to view and manage matches for their franchises.
 */
@Injectable()
export class MatchFranchiseStaffGuard implements CanActivate {
    constructor(
    @InjectRepository(FranchiseStaffAppointment)
    private readonly staffAppointmentRepo: Repository<FranchiseStaffAppointment>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    private readonly populateService: PopulateService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const payload = ctx.getContext().req.user as UserPayload;

        if (!payload?.userId || !payload?.currentOrganizationId) {
            throw new GraphQLError("User is not authenticated or not connected to an organization");
        }

        // Get the match from the root
        const match = ctx.getRoot<Match>();

        // Load matchParent and fixture
        const matchParent = await this.populateService.populateOneOrFail(Match, match, "matchParent");
        const fixture = await this.populateService.populateOne(MatchParent, matchParent, "fixture");

        if (!fixture) {
            throw new GraphQLError("Match is not associated with a fixture (may be a scrim)");
        }

        // Get the user's member ID
        const member = await this.memberRepo.findOne({
            where: {
                userId: payload.userId,
                organizationId: payload.currentOrganizationId,
            },
        });

        if (!member) {
            throw new GraphQLError("User is not a member of the current organization");
        }

        // Check if user is franchise staff for either the home or away franchise
        const staffAppointment = await this.staffAppointmentRepo.findOne({
            where: [
                {
                    member: {id: member.id},
                    franchise: {id: fixture.homeFranchiseId},
                },
                {
                    member: {id: member.id},
                    franchise: {id: fixture.awayFranchiseId},
                },
            ],
        });

        if (!staffAppointment) {
            throw new GraphQLError("User is not franchise staff for either franchise in this match");
        }

        return true;
    }
}
