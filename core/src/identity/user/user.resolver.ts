import {UseGuards} from "@nestjs/common";
import {Query, ResolveField, Resolver, Root} from "@nestjs/graphql";

import {AuthenticatedUser} from "../../authentication/decorators";
import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import {JwtAuthPayload} from "../../authentication/types";
import {OrganizationRepository} from "../../organization/database/organization.repository";
import {OrganizationObject, organizationObjectFromEntity} from "../../organization/graphql/organization.object";
import {UserRepository} from "../database/user.repository";
import {UserObject, userObjectFromEntity} from "../graphql/user.object";

@Resolver(() => UserObject)
export class UserResolver {
    // TODO: This needs to be in a service
    constructor(
        private readonly userRepository: UserRepository,
        private readonly orgRepository: OrganizationRepository,
    ) {}

    @Query(() => UserObject)
    @UseGuards(GraphQLJwtAuthGuard)
    async me(@AuthenticatedUser() user: JwtAuthPayload): Promise<UserObject> {
        const userEntity = await this.userRepository.findById(user.userId, { relations: { profile: true, members: { profile: true }}});
        return userObjectFromEntity(userEntity, userEntity.profile);
    }

    @ResolveField(() => OrganizationObject, {nullable: true})
    async currentOrganization(
        @Root() root: UserObject,
        @AuthenticatedUser() user: JwtAuthPayload,
    ): Promise<OrganizationObject | undefined> {
        const currentOrgId = user.currentOrganizationId;
        if (!currentOrgId) return undefined;
        const org = await this.orgRepository.findById(currentOrgId, {relations: {profile: true}});
        return organizationObjectFromEntity(org, org.profile);
    }

    @ResolveField(() => [OrganizationObject])
    async organizations(@Root() root: UserObject): Promise<OrganizationObject[]> {
        const explodedRoot = await this.userRepository.findById(root.id, {
            relations: {
                members: {
                    organization: {
                        profile: true,
                    },
                },
            },
        });
        const orgs = explodedRoot.members.map(m => m.organization);
        return orgs.map(o => organizationObjectFromEntity(o, o.profile));
    }
}
