import {Injectable, Logger} from "@nestjs/common";
import {DataSource} from "typeorm";

import type {NewPlayer} from "./elo-connector/schemas";

export interface CurrentEloValues {
    player_id: number;
    elo: number;
    league: string;
    salary: number;
    name: string;
}

@Injectable()
export class EloService {
    private readonly logger = new Logger(EloService.name);

    constructor(private readonly dataSource: DataSource) {}

    async prepMigrationData(): Promise<NewPlayer[]> {
        // Run queries, first refreshing the materialized view
        this.logger.verbose("Refreshing materialized view.");
        await this.dataSource.manager.query("REFRESH MATERIALIZED VIEW mledb.v_current_elo_values");

        // Then querying from it
        /* eslint-disable @typescript-eslint/no-unsafe-assignment,
        @typescript-eslint/no-explicit-any */
        this.logger.verbose("Querying the materialized view.");
        const rawData: CurrentEloValues[] = await this.dataSource.manager.query(
            "SELECT player_id, elo, league, salary, name FROM mledb.v_current_elo_values",
        );

        this.logger.verbose(`Elo Service, querying migration data: ${JSON.stringify(rawData[0])}`);
        // Now, we build a NewPlayer instance for each row of data returned from
        // the query
        const output: NewPlayer[] = rawData.map(r => ({
            id: r.player_id,
            name: r.name,
            salary: r.salary,
            skillGroup: this.skillGroupStringToInt(r.league), // Map strings to numbers? not sure yet
            elo: r.elo,
        }));

        this.logger.verbose(`Object build from query: ${JSON.stringify(output[0])}`);

        return output;
    }

    skillGroupStringToInt(skillGroup: string): number {
        // TODO: Change strings here to match skillGroupCode in sprocket schema
        // once MLEDB migration is complete.
        switch (skillGroup) {
            case "FOUNDATION": {
                return 5;
            }
            case "ACADEMY": {
                return 4;
            }
            case "CHAMPION": {
                return 3;
            }
            case "MASTER": {
                return 2;
            }
            case "PREMIER": {
                return 1;
            }
            default: {
                // throw new Error(`ERROR: SkillGroup ${skillGroup} does not exist!`);
                return 0;
            }
        }
    }
}
