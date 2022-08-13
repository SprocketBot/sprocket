import {Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import type {FeatureCode} from "../../database";
import {
    EnabledFeature, GameFeature, Organization,
} from "../../database";

@Injectable()
export class GameFeatureService {
    private readonly logger = new Logger(GameFeatureService.name);

    constructor(
        @InjectRepository(GameFeature) private readonly gameFeatureRepository: Repository<GameFeature>,
        @InjectRepository(EnabledFeature) private readonly enabledFeatureRepository: Repository<EnabledFeature>,
        @InjectRepository(Organization) private readonly organizationRepository: Repository<Organization>,
    ) {}

    async featureIsEnabled(code: FeatureCode, gameId: number, organizationId: number): Promise<boolean> {
        const enabledFeature = await this.enabledFeatureRepository.findOne({
            where: {
                organization: {
                    id: organizationId,
                },
                feature: {
                    feature: {
                        code: code,
                    },
                    game: {
                        id: gameId,
                    },
                },
            },
            relations: {
                organization: true,
                feature: {
                    feature: {
                        dependencies: true,
                    },
                    game: true,
                },
            },
        });

        if (!enabledFeature) return false;
        if (!enabledFeature.feature.feature.dependencies.length) return true;

        const featureDependenciesEnabled = await Promise.all(enabledFeature.feature.feature.dependencies.map(async dep => this.featureIsEnabled(dep.code, gameId, organizationId)));
        if (!featureDependenciesEnabled.every(fde => fde)) return false;

        return true;
    }
}
