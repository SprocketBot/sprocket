import {Injectable} from "@nestjs/common";

import type {MLE_PlayerStatsCore} from "../../database/mledb";

export interface SprocketRating {
    opi: number;
    dpi: number;
    gpi: number;
}
@Injectable()
export class SprocketRatingService {
    calcSprocketRating(core: MLE_PlayerStatsCore): SprocketRating {
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

        const opi_raw = (OPI_goal_w * (core.goals / 1.5)) + (OPI_assist_w * (core.assists / 0.75)) + (OPI_shot_w * (core.shots / 1.75));
        const opi = 100.0 / (1 + Math.exp(OPI_beta * ((opi_raw - OPI_mu) / OPI_sigma)));

        const dpi_raw = (DPI_goal_w * (2.0 - (core.goals_against / 2.0 / 1.5))) + (DPI_saves_w * (core.saves / 1.75)) + (DPI_shot_w * (2.0 - (core.shots_against / 2.0 / 3.75)));
        const dpi = 100.0 / (1 + Math.exp(DPI_beta * ((dpi_raw - DPI_mu) / DPI_sigma)));

        const gpi = (opi + dpi) / 2.0;

        return {
            opi, dpi, gpi,
        };
    }
}
