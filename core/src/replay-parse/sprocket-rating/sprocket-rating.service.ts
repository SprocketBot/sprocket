import {Injectable, Logger} from "@nestjs/common";

import type {MLE_PlayerStatsCore} from "../../database/mledb";

export interface SprocketRating {
    opi: number;
    dpi: number;
    gpi: number;
}
@Injectable()
export class SprocketRatingService {
    private logger = new Logger(SprocketRatingService.name);

    calcSprocketRating(core: Partial<MLE_PlayerStatsCore>): SprocketRating {
        const OPI_goal_w = 1.0;
        const OPI_assist_w = 0.8;
        const OPI_shot_w = 0.2;

        const DPI_goal_w = 1.1;
        const DPI_saves_w = 0.5;
        const DPI_shot_w = 0.4;

        const OPI_beta = -1 * Math.log(9);
        const OPI_mu =  2.03;
        const OPI_sigma = 1.38;

        const DPI_beta = OPI_beta;
        const DPI_mu = 1.93;
        const DPI_sigma = 0.85;

        const goals = core.goals ?? 0;
        const assists = core.assists ?? 0;
        const shots = core.shots ?? 0;
        const saves = core.saves ?? 0;
        const goals_against = core.goals_against ?? 0;
        const shots_against = core.shots_against ?? 0;

        if ((goals + assists + shots + saves + goals_against + shots_against) > 0) {
            const opi_raw = (OPI_goal_w * (goals / 1.5)) + (OPI_assist_w * (assists / 0.75)) + (OPI_shot_w * (shots / 1.75));
            const opi = 100.0 / (1 + Math.exp(OPI_beta * ((opi_raw - OPI_mu) / OPI_sigma)));

            const dpi_raw = (DPI_goal_w * (2.0 - (goals_against / 2.0 / 1.5))) + (DPI_saves_w * (saves / 1.75)) + (DPI_shot_w * (2.0 - (shots_against / 2.0 / 3.75)));
            const dpi = 100.0 / (1 + Math.exp(DPI_beta * ((dpi_raw - DPI_mu) / DPI_sigma)));

            const gpi = (opi + dpi) / 2.0;

            return {
                opi, dpi, gpi,
            };
        }

        this.logger.warn(`Received null data in sprocket rating calculation. ${core.goals}, ${core.assists}, ${core.shots}, ${core.saves}, ${core.goals_against}, ${core.shots_against}.`);
        return {
            opi: 0.0,
            dpi: 0.0,
            gpi: 0.0,
        };

    }
}
