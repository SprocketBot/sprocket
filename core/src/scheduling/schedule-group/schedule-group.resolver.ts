import {ResolveField, Resolver, Root} from "@nestjs/graphql";

import type {Game} from "$models";

import type {ScheduleFixture, ScheduleGroupType} from "../../database";
import {ScheduleGroup} from "../../database";
import {PopulateService} from "../../util/populate/populate.service";

@Resolver(() => ScheduleGroup)
export class ScheduleGroupResolver {
    constructor(private readonly populate: PopulateService) {}

    @ResolveField()
    async type(@Root() root: ScheduleGroup): Promise<ScheduleGroupType> {
        if (root.type) return root.type;
        return this.populate.populateOneOrFail(ScheduleGroup, root, "type");
    }

    @ResolveField()
    async game(@Root() root: ScheduleGroup): Promise<Game> {
        if (root.game) return root.game;
        return this.populate.populateOneOrFail(ScheduleGroup, root, "game");
    }

    @ResolveField()
    async parentGroup(@Root() root: ScheduleGroup): Promise<ScheduleGroup | undefined> {
        if (root.parentGroup) return root.parentGroup;
        return this.populate.populateOne(ScheduleGroup, root, "parentGroup");
    }

    @ResolveField()
    async childGroups(@Root() root: ScheduleGroup): Promise<ScheduleGroup[]> {
        if (root.childGroups) return root.childGroups;
        return this.populate.populateMany(ScheduleGroup, root, "childGroups");
    }

    @ResolveField()
    async fixtures(@Root() root: ScheduleGroup): Promise<ScheduleFixture[]> {
        if (root.fixtures) return root.fixtures;
        return this.populate.populateMany(ScheduleGroup, root, "fixtures");
    }
}
