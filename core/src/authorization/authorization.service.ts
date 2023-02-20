import {Injectable} from "@nestjs/common";

import {UserRepository} from "../identity/database/user.repository";
import {MemberRepository} from "../organization/database/member.repository";

@Injectable()
export class AuthorizationService {
    constructor(private readonly userRepository: UserRepository, private readonly memberRepository: MemberRepository) {}

    async getMemberActions(memberId: number): Promise<string[]> {
        const member = await this.memberRepository.findById(memberId, {
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

    async getUserActions(userId: number, organizationId: number): Promise<string[]> {
        const user = await this.userRepository.findById(userId, {
            relations: {
                members: {
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
            },
        });

        const actions = new Set<string>();

        for (const member of user.members) {
            for (const seat of member.organizationStaffSeats) {
                const permissions = seat.position.bearer.permissions.concat(
                    seat.position.role.bearer.permissions,
                    seat.position.team.bearer.permissions,
                );

                for (const permission of permissions) {
                    if (permission.action.code.startsWith("Global:")) actions.add(permission.action.code.slice(7));
                    else if (member.organizationId === organizationId) {
                        actions.add(permission.action.code);
                    }
                }
            }
        }

        return Array.from(actions);
    }

    async can(userId: number, organizationId: number, action: string): Promise<boolean> {
        const actions = await this.getUserActions(userId, organizationId);
        return actions.includes(action);
    }
}
