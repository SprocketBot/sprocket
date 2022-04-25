import {Injectable, Logger} from "@nestjs/common";
import type {
    Scrim, ScrimGame, ScrimPlayer,
    ScrimTeam,
} from "@sprocketbot/common";
import {ScrimMode} from "@sprocketbot/common";
import shuffle from "lodash.shuffle";

import {ScrimGroupService} from "../scrim-group/scrim-group.service";
import {createCombinations} from "./combinations";

@Injectable()
export class GameOrderService {
    private readonly logger = new Logger(GameOrderService.name);

    constructor(private readonly scrimGroupService: ScrimGroupService) {}

    generateGameOrder(scrim: Scrim): ScrimGame[] {
        switch (scrim.settings.mode) {
            case ScrimMode.BEST_OF:
                return this.generateBestOfGameOrder(scrim);
            case ScrimMode.ROUND_ROBIN:
                return this.generateRoundRobinGameOrder(scrim);
            default:
                throw new Error(`Unexpected scrim mode: ${scrim.settings.mode} found while trying to generate game order`);
        }
    }

    private generateBestOfGameOrder(scrim: Scrim): ScrimGame[] {
        const playerCombinations: ScrimPlayer[][] = new Array(scrim.settings.teamCount).fill(null)
            .map(() => []) as ScrimPlayer[][];
        const groups = this.scrimGroupService.getScrimGroups(scrim);
        // Push each group
        Object.values(groups).forEach((g, i) => {
            playerCombinations[i] = g;
        });

        const everyoneElse = this.scrimGroupService.getUngroupedPlayers(scrim);
        // Get everybody else on to a non-full team
        while (everyoneElse.length) {
            // < start with some random team >
            let i = Math.floor(Math.random() * playerCombinations.length);
            const initialI = i;
            // < if that team is full, find some non-full team >
            while (playerCombinations[i].length === scrim.settings.teamSize) {
                i = (i + 1) % playerCombinations.length;
                if (i === initialI) {
                    throw new Error("Performed full loop while attempting to assign player to a team.");
                }
            }
            playerCombinations[i].push(everyoneElse.shift()!);
        }

        // Assert that things are as expected
        if (playerCombinations.length !== scrim.settings.teamCount) throw new Error("Unexpected number of teams generated");
        if (!playerCombinations.every(t => t.length === scrim.settings.teamSize)) throw new Error("Unexpected number of players placed onto team");

        const games: ScrimGame = {
            teams: playerCombinations.map<ScrimTeam>((pc: ScrimPlayer[]) => ({
                players: pc,
            })),
        };

        // Fill out a 5-game order
        return [ {...games}, {...games}, {...games}, {...games}, {...games} ];
    }

    private generateRoundRobinGameOrder(scrim: Scrim): ScrimGame[] {
        const output: ScrimGame[] = [];
        const {teamSize, teamCount} = scrim.settings;
        const possibleTeams = createCombinations(scrim.players, teamSize, {
            sort: (a, b) => a.id - b.id,
        });
        const possibleGames = createCombinations<ScrimPlayer[]>(possibleTeams, teamCount, {
            check: ([teamA, teamB]) => teamA.every(playerA => !teamB.find(playerB => playerA.id === playerB.id)),
        });
        shuffle(possibleGames);
        const numGames = 5; // for now
        for (let i = 0;i < numGames;i++) {
            output.push({
                teams: possibleGames[i % possibleGames.length].map(players => ({players})),
            });
        }

        return output;
    }
}
