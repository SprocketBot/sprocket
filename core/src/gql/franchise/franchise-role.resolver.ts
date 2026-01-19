import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FranchiseRoleObject, AssignFranchiseRoleInput } from './franchise-role.object';
import { FranchiseRoleRepository } from '../../db/franchise_role/franchise_role.repository';
import { FranchiseRepository } from '../../db/franchise/franchise.repository';
import { UserRepository } from '../../db/user/user.repository';
import { AuthorizeGuard } from '../../auth/authorize/authorize.guard';
import { Resource, ResourceAction } from '@sprocketbot/lib/types';
import { AuthPossession, UsePermissions } from 'nest-authz';

@Resolver(() => FranchiseRoleObject)
export class FranchiseRoleResolver {
    constructor(
        private readonly franchiseRoleRepo: FranchiseRoleRepository,
        private readonly franchiseRepo: FranchiseRepository,
        private readonly userRepo: UserRepository,
    ) { }

    @UseGuards(AuthorizeGuard({ action: ResourceAction.Create }))
    @UsePermissions({
        resource: Resource.FranchiseRole,
        action: ResourceAction.Create,
        possession: AuthPossession.ANY,
    })
    @Mutation(() => FranchiseRoleObject)
    async assignFranchiseRole(@Args('data') data: AssignFranchiseRoleInput): Promise<FranchiseRoleObject> {
        const franchise = await this.franchiseRepo.findOneOrFail({ where: { id: data.franchiseId } });
        const user = await this.userRepo.findOneOrFail({ where: { id: data.userId } });

        const franchiseRole = this.franchiseRoleRepo.create({
            franchise,
            user,
            roleType: data.roleType,
            assignedAt: new Date(),
        });

        return this.franchiseRoleRepo.save(franchiseRole) as unknown as FranchiseRoleObject;
    }

    @UseGuards(AuthorizeGuard({ action: ResourceAction.Delete }))
    @UsePermissions({
        resource: Resource.FranchiseRole,
        action: ResourceAction.Delete,
        possession: AuthPossession.ANY,
    })
    @Mutation(() => FranchiseRoleObject)
    async removeFranchiseRole(@Args('id') id: string): Promise<FranchiseRoleObject> {
        const franchiseRole = await this.franchiseRoleRepo.findOneOrFail({
            where: { id },
            relations: ['user', 'franchise'],
        });
        await this.franchiseRoleRepo.remove(franchiseRole);
        return franchiseRole as unknown as FranchiseRoleObject;
    }
}
