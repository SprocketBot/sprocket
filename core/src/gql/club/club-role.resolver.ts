import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ClubRoleObject, AssignClubRoleInput } from './club-role.object';
import { ClubRoleRepository } from '../../db/club_role/club_role.repository';
import { ClubRepository } from '../../db/club/club.repository';
import { UserRepository } from '../../db/user/user.repository';
import { AuthorizeGuard } from '../../auth/authorize/authorize.guard';
import { Resource, ResourceAction } from '@sprocketbot/lib/types';
import { AuthPossession, UsePermissions } from 'nest-authz';

@Resolver(() => ClubRoleObject)
export class ClubRoleResolver {
    constructor(
        private readonly clubRoleRepo: ClubRoleRepository,
        private readonly clubRepo: ClubRepository,
        private readonly userRepo: UserRepository,
    ) { }

    @UseGuards(AuthorizeGuard({ action: ResourceAction.Create }))
    @UsePermissions({
        resource: Resource.ClubRole,
        action: ResourceAction.Create,
        possession: AuthPossession.ANY,
    })
    @Mutation(() => ClubRoleObject)
    async assignClubRole(@Args('data') data: AssignClubRoleInput): Promise<ClubRoleObject> {
        const club = await this.clubRepo.findOneOrFail({ where: { id: data.clubId } });
        const user = await this.userRepo.findOneOrFail({ where: { id: data.userId } });

        const clubRole = this.clubRoleRepo.create({
            club,
            user,
            roleType: data.roleType,
            assignedAt: new Date(),
        });

        return this.clubRoleRepo.save(clubRole) as unknown as ClubRoleObject;
    }

    @UseGuards(AuthorizeGuard({ action: ResourceAction.Delete }))
    @UsePermissions({
        resource: Resource.ClubRole,
        action: ResourceAction.Delete,
        possession: AuthPossession.ANY,
    })
    @Mutation(() => ClubRoleObject)
    async removeClubRole(@Args('id') id: string): Promise<ClubRoleObject> {
        const clubRole = await this.clubRoleRepo.findOneOrFail({
            where: { id },
            relations: ['user', 'club'],
        });
        await this.clubRoleRepo.remove(clubRole);
        return clubRole as unknown as ClubRoleObject;
    }
}
