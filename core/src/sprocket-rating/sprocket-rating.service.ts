import {Injectable, Logger} from "@nestjs/common";

import type {SprocketRating, SprocketRatingInput} from "./sprocket-rating.types";

@Injectable()
export class SprocketRatingService {
    private logger = new Logger(SprocketRatingService.name);

    calcSprocketRating(core: SprocketRatingInput): SprocketRating {
        // TODO: Make this non-nullable
        const team_size = core.team_size;

        if (team_size === 2) {
            return this.calcSprocketRating2s(core);
        } else if (team_size === 3) {
            return this.calcSprocketRating3s(core);
        }
        throw new Error(`Sprocket rating is not yet available for teams of ${team_size} players`);

    }

    calcSprocketRating2s(core: SprocketRatingInput): SprocketRating {
        const OPI_goal_w = 1.0;
        const OPI_assist_w = 0.8;
        const OPI_shot_w = 0.2;
        const DPI_goal_w = 1.1;
        const DPI_saves_w = 0.5;
        const DPI_shot_w = 0.4;

        const G_2s = 1.54;
        const A_2s = 0.79;
        const Sv_2s = 1.75;
        const Sh_2s = 3.93;

        const xOPI_2s = 2.01;
        const yOPI_2s = 1.34;
        const xDPI_2s = 1.94;
        const yDPI_2s = 1.09;

        const OPI_beta = -1 * Math.log(9);
        const DPI_beta = OPI_beta;

        const {
            goals, assists, shots, saves, goals_against, shots_against,
        } = core;

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

    calcSprocketRating3s(core: SprocketRatingInput): SprocketRating {
        const OPI_goal_w = 1.0;
        const OPI_assist_w = 0.8;
        const OPI_shot_w = 0.2;
        const DPI_goal_w = 1.1;
        const DPI_saves_w = 0.5;
        const DPI_shot_w = 0.4;

        const G_3s = 0.77;
        const A_3s = 0.53;
        const Sv_3s = 1.24;
        const Sh_3s = 2.43;

        const xOPI_3s = 2.00;
        const yOPI_3s = 1.69;
        const xDPI_3s = 1.96;
        const yDPI_3s = 0.93;

        const OPI_beta = -1 * Math.log(9);
        const DPI_beta = OPI_beta;

        const {
            goals, assists, shots, saves, goals_against, shots_against,
        } = core;

        if ((goals + assists + shots + saves + goals_against + shots_against) > 0) {
            const opi_raw = (OPI_goal_w * (goals / G_3s)) + (OPI_assist_w * (assists / A_3s)) + (OPI_shot_w * (shots / Sh_3s));
            const opi = 100.0 / (1 + Math.exp(OPI_beta * ((opi_raw - xOPI_3s) / yOPI_3s)));

            const dpi_raw = (DPI_goal_w * (2.0 - (goals_against / 3.0 / G_3s))) + (DPI_saves_w * (saves / Sv_3s)) + (DPI_shot_w * (2.0 - (shots_against / 3.0 / Sh_3s)));
            const dpi = 100.0 / (1 + Math.exp(DPI_beta * ((dpi_raw - xDPI_3s) / yDPI_3s)));

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
