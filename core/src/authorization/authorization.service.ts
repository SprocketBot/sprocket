import {Injectable} from "@nestjs/common";

import {
    ActionRepository,
    MemberRepository,
    OrganizationStaffPositionRepository,
    OrganizationStaffRoleRepository,
    OrganizationStaffTeamRepository,
} from "$repositories";

@Injectable()
export class AuthorizationService {
    constructor(
        private readonly memberRepository: MemberRepository,
        private readonly actionRepository: ActionRepository,
        private readonly organizationStaffTeamRepository: OrganizationStaffTeamRepository,
        private readonly organizationStaffRoleRepository: OrganizationStaffRoleRepository,
        private readonly organizationStaffPositionRepository: OrganizationStaffPositionRepository,
    ) {}

    async getMemberActions(memberId: number): Promise<string[]> {
        const member = await this.memberRepository.getById(memberId, {
            relations: {
                organizationStaffSeats: {
                    position: {
                        role: {
                            bearer: {
                                permissions: {
                                    action: true,
                                },
                            },
                        },
                        team: {
                            bearer: {
                                permissions: {
                                    action: true,
                                },
                            },
                        },
                        bearer: {
                            permissions: {
                                action: true,
                            },
                        },
                    },
                },
            },
        });

        const actions = new Set<string>();

        for (const seat of member.organizationStaffSeats) {
            for (const permission of seat.position.bearer.permissions) actions.add(permission.action.code);
            for (const permission of seat.position.role.bearer.permissions) actions.add(permission.action.code);
            for (const permission of seat.position.team.bearer.permissions) actions.add(permission.action.code);
        }

        return Array.from(actions);
    }
}
