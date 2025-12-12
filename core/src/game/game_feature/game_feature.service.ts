import {Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {GraphQLError} from "graphql";
import {Repository} from "typeorm";

import {FeatureCode} from '$db/game/feature/feature.enum';
import {EnabledFeature} from '$db/game/enabled_feature/enabled_feature.model';
import {GameFeature} from '$db/game/game_feature/game_feature.model';
import {Organization} from '$db/organization/organization/organization.model';

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

    async enableFeature(code: FeatureCode, gameId: number, organizationId: number): Promise<EnabledFeature> {
        const feature = await this.gameFeatureRepository.findOneOrFail({
            where: {feature: {code} },
            relations: {feature: {dependencies: true} },
        });
        const organization = await this.organizationRepository.findOneOrFail({
            where: {id: organizationId},
        });

        const featureDependenciesEnabled = await Promise.all(feature.feature.dependencies.map(async dep => this.featureIsEnabled(dep.code, gameId, organizationId)));
        if (!featureDependenciesEnabled.every(fde => fde)) throw new GraphQLError(`Dependencies for code=${code} are missing`);

        const enabledFeature = this.enabledFeatureRepository.create({feature, organization});
        await this.enabledFeatureRepository.save(enabledFeature);
        
        return enabledFeature;
    }

    async disableFeature(code: FeatureCode, gameId: number, organizationId: number): Promise<EnabledFeature> {
        const enabledFeature = await this.enabledFeatureRepository.findOneOrFail({
            where: {
                feature: {
                    feature: {
                        code: code,
                    },
                    game: {
                        id: gameId,
                    },
                },
                organization: {
                    id: organizationId,
                },
            },
            relations: {
                feature: {
                    feature: true,
                    game: true,
                },
                organization: true,
            },
        });

        const allGameFeatures = await this.gameFeatureRepository.find({
            where: {
                game: {
                    id: gameId,
                },
            },
            relations: {
                game: true,
                feature: {
                    dependencies: true,
                },
                enabledOrgs: {
                    organization: true,
                },
            },
        });

        if (allGameFeatures.some(gameFeature => gameFeature.feature.dependencies.some(dep => dep.code === code)
            && gameFeature.enabledOrgs.some(orgEnabledFeature => orgEnabledFeature.organization.id === organizationId))) throw new GraphQLError(`Enabled feature code=${code} is a dependency to an enabled feature`);

        await this.enabledFeatureRepository.delete(enabledFeature.id);

        return enabledFeature;
    }
}
