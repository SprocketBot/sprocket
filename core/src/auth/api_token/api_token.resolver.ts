import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ApiTokenService } from './api_token.service';
import { ApiToken, ApiTokenAndSecret } from './api_token.object';
import { CurrentUser } from '../current-user/current-user.decorator';
import type { User } from '@sprocketbot/lib/types'; // Type-only import
import { UserEntity } from '../../db/user/user.entity';
import { GqlAuthGuard } from '../guards/gql-auth.guard'; // Correct Guard path
import { RbacService } from '../rbac/rbac.service';

@Resolver(() => ApiToken)
export class ApiTokenResolver {
    constructor(
        private readonly apiTokenService: ApiTokenService,
        private readonly rbacService: RbacService,
    ) {}

    @Mutation(() => ApiTokenAndSecret)
    @UseGuards(GqlAuthGuard)
    async generateApiToken(
        @CurrentUser() user: User,
        @Args('name') name: string,
        @Args('scopes', { type: () => [String] }) scopes: string[],
        @Args('expiresAt', { type: () => Date, nullable: true }) expiresAt?: Date,
    ): Promise<ApiTokenAndSecret> {
        const userEntity = { id: user.id } as UserEntity;
        
        const { token, apiToken } = await this.apiTokenService.createToken(userEntity, name, scopes, expiresAt);
        
        return {
            ...apiToken,
            secret: token,
        };
    }

    @Query(() => [ApiToken])
    @UseGuards(GqlAuthGuard)
    async getMyApiTokens(@CurrentUser() user: User): Promise<ApiToken[]> {
        return this.apiTokenService.getTokensForUser(user.id);
    }
    
    @Mutation(() => Boolean)
    @UseGuards(GqlAuthGuard)
    async revokeApiToken(
        @CurrentUser() user: User,
        @Args('tokenId') tokenId: string,
    ): Promise<boolean> {
        await this.apiTokenService.revokeToken(tokenId, { id: user.id } as UserEntity);
        return true;
    }

    @Query(() => [String])
    @UseGuards(GqlAuthGuard)
    async getAvailableScopes(@CurrentUser() user: User): Promise<string[]> {
        return this.rbacService.getAllPermissionsForUser(parseInt(user.id));
    }
}
