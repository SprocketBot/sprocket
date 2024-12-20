import {Injectable, Logger} from "@nestjs/common";
import type {
    Scrim, ScrimGame, ScrimPlayer,
    ScrimTeam,
} from "@sprocketbot/common";
import {ScrimMode, ScrimStatus} from "@sprocketbot/common";
import { add, sub } from "date-fns";
import { now } from "lodash";

import {ScrimGroupService} from "../scrim-group/scrim-group.service";

@Injectable()
export class GameOrderService {
    private readonly logger = new Logger(GameOrderService.name);
    private threesPartitions: number[][][] = [];
    private twosPartitions: number[][][] = [];

    constructor(private readonly scrimGroupService: ScrimGroupService) {
        // Generate all possible team permutations for 3v3
        this.allPartitions([1,2,3,4,5,6], this.threesPartitions, 3);
        // Do the same for 2v2 (there are 3, this is overkill)
        this.allPartitions([1, 2, 3, 4], this.twosPartitions, 2);
    }

    // This probably seems really dumb, because we're wasting O(2^n) time and
    // space generating all subsets and then throwing away the ones that don't
    // meet our criteria. I recognize this, and accept responsibility, because
    // I couldn't be arsed to get the proper algorithm (Ruskey's, if you're
    // curious) working properly. We use this for such small sets that even 
    // powerset complexity is acceptable. 
    collectPartitions(partition: number[][], teamSize: number, final: number[][][]): void {
        let part: number[][] = [];
        for (const team of partition) {
                if (team.length != teamSize) {
                    return;
                }
            part.push([...team]);
        }
        final.push(part);
    }

    Partition(set: number[], index: number, ans: number[][], final: number[][][], teamSize: number): void {
        // If we have considered all elements
        // in the set print the partition
        if (index === set.length) {
            this.collectPartitions(ans, teamSize, final);
            return;
        }
    
        // For each subset in the partition
        // add the current element to it
        // and recall
        for (let i = 0; i < ans.length; i++) {
            const el = set[index];
            ans[i].push(el);
            this.Partition(set, index + 1, ans, final, teamSize);
            ans[i].pop();
        }
    
        // Add the current element as a
        // singleton subset and recall
        const el = set[index];
        ans.push([el]);
        this.Partition(set, index + 1, ans, final, teamSize);
        ans.pop();
    };
    
    allPartitions(set: number[], output: number[][][], teamSize: number): void {
        let ans = [];
        this.Partition(set, 0, ans, output, teamSize);
    };
    generateGameOrder(scrim: Scrim): ScrimGame[] {
        switch (scrim.settings.mode) {
            case ScrimMode.TEAMS:
                return this.generateTeamsGameOrder(scrim);
            case ScrimMode.ROUND_ROBIN:
                return this.generateRoundRobinGameOrder(scrim);
            default:
                throw new Error(`Unexpected scrim mode: ${scrim.settings.mode} found while trying to generate game order`);
        }
    }

    private generateTeamsGameOrder(scrim: Scrim): ScrimGame[] {
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

        // Fill out a 3-game order
        return [ {...games}, {...games}, {...games} ];
    }

    private generateRoundRobinGameOrder(scrim: Scrim): ScrimGame[] {
        const output: ScrimGame[] = [];
        const {teamSize, teamCount} = scrim.settings;

        const numGames = 3; // for now
        const usedPartitions = new Set<number>();
        const numPartitions = teamSize === 3 ? 10 : 3;
        let partition = Math.floor(Math.random() * numPartitions);
        for (let i = 0; i < numGames; i++) {
            while (usedPartitions.has(partition)) {
                partition = Math.floor(Math.random() * numPartitions);
            }
            usedPartitions.add(partition);

            if (teamSize === 3) {
                output.push({
                    teams: this.threesPartitions[partition].map(i => {
                        return {
                            players: i.map(j => scrim.players[j-1])
                        }
                    }),
                });
            } else {
                output.push({
                    teams: this.twosPartitions[partition].map(i => {
                        return {
                            players: i.map(j => scrim.players[j-1])
                        }
                    }),
                });               
            }
        }

        return output;
    }
}
