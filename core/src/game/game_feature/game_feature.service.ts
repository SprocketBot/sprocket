import {forwardRef, Inject, Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import type {FeatureCode} from "../../database";
import {EnabledFeature, GameFeature} from "../../database";
import {OrganizationService} from "../../organization";

@Injectable()
export class GameFeatureService {
    private readonly logger = new Logger(GameFeatureService.name);

    constructor(
        @Inject(forwardRef(() => OrganizationService)) private readonly organizationService: OrganizationService,
        @InjectRepository(GameFeature) private readonly gameFeatureRepository: Repository<GameFeature>,
        @InjectRepository(EnabledFeature) private readonly enabledFeatureRepository: Repository<EnabledFeature>,
    ) {}

    async featureIsEnabled(code: FeatureCode, organizationId: number): Promise<boolean> {
        return false;
    }
}
