import {Inject, Injectable} from "@nestjs/common";
import type {FindOneOptions} from "typeorm";
import {DataSource} from "typeorm";

import {ExtendedRepository, ProfiledRepository} from "../../types/extended-repositories";
import {GameSkillGroup} from "./game-skill-group.entity";
import type {GameSkillGroupProfile} from "./game-skill-group-profile.entity";
import {GameSkillGroupProfileRepository} from "./game-skill-group-profile.repository";

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
