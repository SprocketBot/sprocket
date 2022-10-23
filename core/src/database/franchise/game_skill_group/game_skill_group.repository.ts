import {Inject, Injectable} from "@nestjs/common";
import type {FindOneOptions} from "typeorm";
import {DataSource} from "typeorm";

import {ProfiledRepository} from "../../extended-repositories";
import {ExtendedRepository} from "../../extended-repositories/repository";
import {GameSkillGroupProfileRepository} from "../game_skill_group_profile/game_skill_group_profile.repository";
import type {GameSkillGroupProfile} from "../models";
import {GameSkillGroup} from "./game_skill_group.model";

@Injectable()
export class GameSkillGroupRepository extends ExtendedRepository<GameSkillGroup> {
    constructor(readonly dataSource: DataSource) {
        super(GameSkillGroup, dataSource);
    }

    async getByCode(code: string, options?: FindOneOptions<GameSkillGroup>): Promise<GameSkillGroup> {
        return this.findOneOrFail(Object.assign({where: {profile: {code}}, relations: {profile: true}}, options));
    }
}

@Injectable()
export class GameSkillGroupProfiledRepository extends ProfiledRepository<GameSkillGroup, GameSkillGroupProfile> {
    readonly profileInverseRelationshipName: "skillGroup";

    constructor(
        @Inject(GameSkillGroupRepository) readonly primaryRepository: GameSkillGroupRepository,
        @Inject(GameSkillGroupProfileRepository) readonly profileRepository: GameSkillGroupProfileRepository,
    ) {
        super();
    }
}
