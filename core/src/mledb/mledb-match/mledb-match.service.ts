import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import type {LegacyGameMode, MLE_Series} from "../../database/mledb";
import {MLE_Fixture} from "../../database/mledb";

@Injectable()
export class MledbMatchService {
    constructor(@InjectRepository(MLE_Fixture) private readonly fixtureRepo: Repository<MLE_Fixture>) {
    }

    async getMleSeries(awayName: string, homeName: string, matchStart: Date, seasonStart: Date, mode: LegacyGameMode): Promise<MLE_Series> {
        const mleFixture = await this.fixtureRepo.findOneOrFail({
            where: {
                series: {
                    mode: mode,
                },
                awayName: awayName,
                homeName: homeName,
                match: {
                    from: matchStart,
                    season: {
                        startDate: seasonStart,
                    },
                },
            },
            relations: {
                series: true,
                match: {season: true},
            },
        });

        if (mleFixture.series.length !== 1) {
            throw new Error(`Found more than one series matching params ${JSON.stringify({
                awayName, homeName, matchStart, seasonStart, mode,
            })}`);
        }

        return mleFixture.series[0];
    }
}
