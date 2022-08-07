import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindOperator} from "typeorm";
import {Raw, Repository} from "typeorm";

import type {
    League, LegacyGameMode, MLE_Series,
} from "../../database/mledb";
import {MLE_Fixture} from "../../database/mledb";

@Injectable()
export class MledbMatchService {
    constructor(@InjectRepository(MLE_Fixture) private readonly fixtureRepo: Repository<MLE_Fixture>) {
    }

    async getMleSeries(awayName: string, homeName: string, matchStart: Date, seasonStart: Date, mode: LegacyGameMode, league: League): Promise<MLE_Series> {
        const matchByDay: (d: Date) => FindOperator<Date> = (d: Date) => Raw<Date>((alias: string) => `DATE_TRUNC('day', ${alias}) = '${d.toISOString().split("T")[0]}'`) as unknown as FindOperator<Date>;

        const mleFixture = await this.fixtureRepo.findOneOrFail({
            where: {
                series: {
                    mode: mode,
                    league: league,
                },
                awayName: awayName,
                homeName: homeName,
                match: {
                    from: matchByDay(matchStart),
                    season: {
                        startDate: matchByDay(seasonStart),
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
