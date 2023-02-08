import {UseGuards} from "@nestjs/common";
import {Args, Mutation, Query, Resolver} from "@nestjs/graphql";
import {ScrimStatus} from "@sprocketbot/common";
import {GraphQLError} from "graphql";

import {AuthenticatedUser} from "../../authentication/decorators";
import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import {JwtAuthPayload} from "../../authentication/types";
import {AuthorizationService} from "../../authorization/authorization.service";
import {CurrentMember} from "../../authorization/decorators";
import {MemberGuard} from "../../authorization/guards";
import {Member} from "../../organization/database/member.entity";
import {ScrimObject} from "../graphql/scrim/scrim.object";
import {ScrimService} from "./scrim.service";

@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class ScrimAdminResolver {
    constructor(
        private readonly scrimService: ScrimService,
        private readonly authorizationService: AuthorizationService,
    ) {}

    @Query(() => [ScrimObject])
    @UseGuards(MemberGuard)
    async getAllScrims(
        @AuthenticatedUser() user: JwtAuthPayload,
        @CurrentMember() member: Member,
        @Args("status", {
            type: () => ScrimStatus,
            nullable: true,
        })
        status?: ScrimStatus,
    ): Promise<ScrimObject[]> {
        if (!(await this.authorizationService.can(user.userId, member.organizationId, "ListScrims")))
            throw new GraphQLError("Unauthorized");

        const scrims = await this.scrimService.getAllScrims(member.organizationId);

        return (status ? scrims.filter(scrim => scrim.status === status) : scrims) as ScrimObject[];
    }

    @Mutation(() => ScrimObject)
    async cancelScrim(
        @AuthenticatedUser() user: JwtAuthPayload,
        @Args("scrimId") scrimId: string,
    ): Promise<ScrimObject> {
        const scrim = await this.scrimService.getScrimById(scrimId);
        if (!scrim) throw new GraphQLError("Scrim not found");

        if (!(await this.authorizationService.can(user.userId, scrim.organizationId, "CancelScrim")))
            throw new GraphQLError("Unauthorized");

        return this.scrimService.cancelScrim(scrimId) as Promise<ScrimObject>;
    }

    @Mutation(() => Boolean)
    async lockScrim(
        @AuthenticatedUser() user: JwtAuthPayload,
        @Args("scrimId") scrimId: string,
        @Args("reason", {nullable: true}) reason?: string,
    ): Promise<boolean> {
        const scrim = await this.scrimService.getScrimById(scrimId);
        if (!scrim) throw new GraphQLError("Scrim not found");

        if (!(await this.authorizationService.can(user.userId, scrim.organizationId, "LockScrim")))
            throw new GraphQLError("Unauthorized");

        return this.scrimService.setScrimLocked(scrimId, true, reason);
    }

    @Mutation(() => Boolean)
    async unlockScrim(@AuthenticatedUser() user: JwtAuthPayload, @Args("scrimId") scrimId: string): Promise<boolean> {
        const scrim = await this.scrimService.getScrimById(scrimId);
        if (!scrim) throw new GraphQLError("Scrim not found");

        if (!(await this.authorizationService.can(user.userId, scrim.organizationId, "LockScrim")))
            throw new GraphQLError("Unauthorized");

        return this.scrimService.setScrimLocked(scrimId, false);
    }
}
