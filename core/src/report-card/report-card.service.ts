import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {UpsertReportCardAssetRequest} from "@sprocketbot/common";
import {Repository} from "typeorm";

import {ReportCardAsset} from "../database/report-card/report_card_asset.model";

@Injectable()
export class ReportCardService {
    constructor(
        @InjectRepository(ReportCardAsset)
        private readonly reportCardRepo: Repository<ReportCardAsset>,
    ) {}

    async upsertAsset(input: UpsertReportCardAssetRequest): Promise<boolean> {
        const userIds = Array.from(new Set(input.userIds ?? []));
        const franchiseIds = Array.from(new Set(input.franchiseIds ?? []));

        const existing = await this.reportCardRepo.findOne({
            where: {
                type: input.type,
                sprocketId: input.sprocketId,
            },
        });

        if (existing) {
            existing.legacyId = input.legacyId;
            existing.organizationId = input.organizationId;
            existing.minioKey = input.minioKey;
            existing.scrimUuid = input.scrimUuid ?? null;
            existing.userIds = userIds;
            existing.franchiseIds = franchiseIds;
            await this.reportCardRepo.save(existing);
            return true;
        }

        const asset = this.reportCardRepo.create({
            type: input.type,
            sprocketId: input.sprocketId,
            legacyId: input.legacyId,
            organizationId: input.organizationId,
            minioKey: input.minioKey,
            scrimUuid: input.scrimUuid ?? null,
            userIds,
            franchiseIds,
        });

        await this.reportCardRepo.save(asset);
        return true;
    }
}
