import {Args, Mutation, Query, Resolver} from "@nestjs/graphql";

import {Actions} from "../../../authorization/decorators";
import {ScrimToggleService} from "./scrim-toggle.service";

@Resolver()
export class ScrimToggleResolver {
    constructor(private readonly scrimToggleService: ScrimToggleService) {}

    @Query(() => String, {nullable: true})
    async getScrimsDisabled(): Promise<string | null> {
        return this.scrimToggleService.scrimsAreDisabled();
    }

    @Mutation(() => Boolean)
    @Actions("ToggleScrims")
    async disableScrims(@Args("reason", {nullable: true}) reason?: string): Promise<boolean> {
        return this.scrimToggleService.disableScrims(reason);
    }

    @Mutation(() => Boolean)
    @Actions("ToggleScrims")
    async enableScrims(): Promise<boolean> {
        return this.scrimToggleService.enableScrims();
    }
}
