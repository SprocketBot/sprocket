import {Injectable, Logger} from "@nestjs/common";

import type {SprocketRating, SprocketRatingInput} from "./sprocket-rating.types";

@Injectable()
export class SprocketRatingService {
    private logger = new Logger(SprocketRatingService.name);

    calcSprocketRating(core: SprocketRatingInput): SprocketRating {
        const OPI_goal_w = 1.0;
        const OPI_assist_w = 0.8;
        const OPI_shot_w = 0.2;
        const DPI_goal_w = 1.1;
        const DPI_saves_w = 0.5;
        const DPI_shot_w = 0.4;

        const G_2s = 1.5;
        const A_2s = 0.75;
        const Sv_2s = 1.75;
        const Sh_2s = 3.75;

        const xOPI_2s = 2.03;
        const yOPI_2s = 1.38;
        const xDPI_2s = 1.93;
        const yDPI_2s = 0.85;

        const OPI_beta = -1 * Math.log(9);
        const DPI_beta = OPI_beta;

        const goals = core.goals ?? 0;
        const assists = core.assists ?? 0;
        const shots = core.shots ?? 0;
        const saves = core.saves ?? 0;
        const goals_against = core.goals_against ?? 0;
        const shots_against = core.shots_against ?? 0;

        if ((goals + assists + shots + saves + goals_against + shots_against) > 0) {
            const opi_raw = (OPI_goal_w * (goals / G_2s)) + (OPI_assist_w * (assists / A_2s)) + (OPI_shot_w * (shots / Sh_2s));
            const opi = 100.0 / (1 + Math.exp(OPI_beta * ((opi_raw - xOPI_2s) / yOPI_2s)));

            const dpi_raw = (DPI_goal_w * (2.0 - (goals_against / 2.0 / G_2s))) + (DPI_saves_w * (saves / Sv_2s)) + (DPI_shot_w * (2.0 - (shots_against / 2.0 / Sh_2s)));
            const dpi = 100.0 / (1 + Math.exp(DPI_beta * ((dpi_raw - xDPI_2s) / yDPI_2s)));

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
