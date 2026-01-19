import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TeamRoleObject, AssignTeamRoleInput } from './team-role.object';
import { TeamRoleRepository } from '../../db/team_role/team_role.repository';
import { TeamRepository } from '../../db/team/team.repository';
import { UserRepository } from '../../db/user/user.repository';
import { AuthorizeGuard } from '../../auth/authorize/authorize.guard';
import { Resource, ResourceAction } from '@sprocketbot/lib/types';
import { AuthPossession, UsePermissions } from 'nest-authz';

@Resolver(() => TeamRoleObject)
export class TeamRoleResolver {
    constructor(
        private readonly teamRoleRepo: TeamRoleRepository,
        private readonly teamRepo: TeamRepository,
        private readonly userRepo: UserRepository,
    ) { }

    @UseGuards(AuthorizeGuard({ action: ResourceAction.Create }))
    @UsePermissions({
        resource: Resource.TeamRole,
        action: ResourceAction.Create,
        possession: AuthPossession.ANY,
    })
    @Mutation(() => TeamRoleObject)
    async assignTeamRole(@Args('data') data: AssignTeamRoleInput): Promise<TeamRoleObject> {
        const team = await this.teamRepo.findOneOrFail({ where: { id: data.teamId } });
        const user = await this.userRepo.findOneOrFail({ where: { id: data.userId } });

        const teamRole = this.teamRoleRepo.create({
            team,
            user,
            roleType: data.roleType,
            assignedAt: new Date(),
        });

        return this.teamRoleRepo.save(teamRole) as unknown as TeamRoleObject;
    }

    @UseGuards(AuthorizeGuard({ action: ResourceAction.Delete }))
    @UsePermissions({
        resource: Resource.TeamRole,
        action: ResourceAction.Delete,
        possession: AuthPossession.ANY,
    })
    @Mutation(() => TeamRoleObject)
    async removeTeamRole(@Args('id') id: string): Promise<TeamRoleObject> {
        const teamRole = await this.teamRoleRepo.findOneOrFail({
            where: { id },
            relations: ['user', 'team'],
        });
        await this.teamRoleRepo.remove(teamRole);
        return teamRole as unknown as TeamRoleObject;
    }
}
