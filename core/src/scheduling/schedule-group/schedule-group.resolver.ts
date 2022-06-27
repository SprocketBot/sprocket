import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";
import {InjectRepository} from "@nestjs/typeorm";
import {GraphQLError} from "graphql";
import {Repository} from "typeorm";

import type {ScheduleFixture} from "../../database";
import {
    Game, ScheduleGroup, ScheduleGroupType,
} from "../../database";
import {ScheduleFixtureService} from "../schedule-fixture/schedule-fixture.service";

@Resolver(() => ScheduleGroup)
export class ScheduleGroupResolver {
    constructor(
        @InjectRepository(ScheduleGroup)
        private readonly scheduleGroupRepository: Repository<ScheduleGroup>,
        private readonly fixtureService: ScheduleFixtureService,
    ) {
    }

    @ResolveField()
    async type(@Root() root: ScheduleGroup): Promise<ScheduleGroupType> {
        if (root.type) return root.type;
        const relation: ScheduleGroupType | undefined = await this.scheduleGroupRepository.createQueryBuilder()
            .relation(ScheduleGroupType, "type")
            .of(root)
            .loadOne();
        if (!relation) throw new GraphQLError("Unable to find schedule type.");
        return relation;
    }

    @ResolveField()
    async game(@Root() root: ScheduleGroup): Promise<Game> {
        if (root.game) return root.game;
        const game: Game | undefined = await this.scheduleGroupRepository.createQueryBuilder()
            .relation(Game, "game")
            .of(root)
            .loadOne();
        if (!game) throw new GraphQLError("Unable to find schedule game.");
        return game;
    }

    @ResolveField()
    async parentGroup(@Root() root: ScheduleGroup): Promise<ScheduleGroup | undefined> {
        if (root.parentGroup) return root.parentGroup;
        return this.scheduleGroupRepository.createQueryBuilder()
            .relation(ScheduleGroup, "parentGroup")
            .of(root)
            .loadOne();
    }

    //
    @ResolveField()
    async childGroups(@Root() root: ScheduleGroup): Promise<ScheduleGroup[]> {
        if (root.childGroups) return root.childGroups;
        return this.scheduleGroupRepository.createQueryBuilder()
            .relation(ScheduleGroup, "childGroups")
            .of(root)
            .loadMany();
    }

    @ResolveField()
    async fixtures(@Root() root: ScheduleGroup): Promise<ScheduleFixture[]> {
        if (root.fixtures) return root.fixtures;
        return this.fixtureService.getFixturesForGroup(root.id);
    }

}
