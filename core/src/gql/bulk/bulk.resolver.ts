import { Resolver, Mutation, Args, Query, registerEnumType } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BulkService } from '../../bulk/bulk.service';
import { DataService } from '../../bulk/data.service';
import { AuthorizeGuard } from '../../auth/authorize/authorize.guard';
import { Resource, ResourceAction } from '@sprocketbot/lib/types';
import { AuthPossession, UsePermissions } from 'nest-authz';

export enum ExportEntity {
    Franchise = 'Franchise',
    Club = 'Club',
    Team = 'Team',
    Season = 'Season',
}

registerEnumType(ExportEntity, {
    name: 'ExportEntity',
});

@Resolver()
export class BulkResolver {
    constructor(
        private readonly bulkService: BulkService,
        private readonly dataService: DataService,
    ) { }

    @Mutation(() => Number)
    @UseGuards(AuthorizeGuard({ action: ResourceAction.Update }))
    @UsePermissions({
        resource: Resource.User,
        action: ResourceAction.Update,
        possession: AuthPossession.ANY,
    })
    async bulkActivateUsers(@Args({ name: 'userIds', type: () => [String] }) userIds: string[]): Promise<number> {
        return this.bulkService.bulkActivateUsers(userIds);
    }

    @Mutation(() => Number)
    @UseGuards(AuthorizeGuard({ action: ResourceAction.Update }))
    @UsePermissions({
        resource: Resource.User,
        action: ResourceAction.Update,
        possession: AuthPossession.ANY,
    })
    async bulkDeactivateUsers(@Args({ name: 'userIds', type: () => [String] }) userIds: string[]): Promise<number> {
        return this.bulkService.bulkDeactivateUsers(userIds);
    }

    @Query(() => String)
    @UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
    @UsePermissions({
        resource: Resource.Franchise, // Using Franchise as a proxy for high-level read
        action: ResourceAction.Read,
        possession: AuthPossession.ANY,
    })
    async exportData(
        @Args({ name: 'entity', type: () => ExportEntity }) entity: ExportEntity,
        @Args({ name: 'format', type: () => String }) format: 'json' | 'csv',
    ): Promise<string> {
        if (format === 'json') {
            return this.dataService.exportToJson(entity);
        } else {
            return this.dataService.exportToCsv(entity);
        }
    }

    @Mutation(() => Number)
    @UseGuards(AuthorizeGuard({ action: ResourceAction.Create }))
    @UsePermissions({
        resource: Resource.Franchise, // Using Franchise as a proxy for high-level create
        action: ResourceAction.Create,
        possession: AuthPossession.ANY,
    })
    async importData(
        @Args({ name: 'entity', type: () => ExportEntity }) entity: ExportEntity,
        @Args({ name: 'data', type: () => String }) data: string,
    ): Promise<number> {
        return this.dataService.importFromJson(entity, data);
    }
}
