import {Injectable} from "@nestjs/common";
import {RpcException} from "@nestjs/microservices";
import type {Scrim, ScrimPlayer} from "@sprocketbot/common";
import {ScrimMode} from "@sprocketbot/common";
import {nanoid} from "nanoid";

@Injectable()
export class ScrimGroupService {
    getScrimGroups(scrim: Scrim): Record<string, ScrimPlayer[]> {
        return scrim.players.reduce<Record<string, ScrimPlayer[]>>((acc, p) => {
            if (p.group) {
                if (!Array.isArray(acc[p.group])) {
                    acc[p.group] = [];
                }
                acc[p.group].push(p);
            }
            return acc;
        }, {});
    }

    getUngroupedPlayers(scrim: Scrim): ScrimPlayer[] {
        return scrim.players.filter(p => p.group === undefined);
    }

    modeAllowsGroups(mode: ScrimMode): boolean {
        return mode === ScrimMode.BEST_OF;
    }

    canCreateNewGroup(scrim: Scrim): boolean {
        // Currently; only 1 group per team is allowed.
        return scrim.settings.teamCount > Object.keys(this.getScrimGroups(scrim)).length;
    }

    resolveGroupKey(scrim: Scrim, groupKey: string | boolean): string | undefined {
        let output: string | undefined;
        if (typeof groupKey === "string") {
            const scrimGroups = this.getScrimGroups(scrim);
            if (!(groupKey in scrimGroups)) {
                throw new RpcException("Group not found!");
            }
            if (scrimGroups[groupKey].length === scrim.settings.teamSize) {
                throw new RpcException("Group is full!");
            }
            output = groupKey;
        } else if (groupKey) {
            if (!this.canCreateNewGroup(scrim)) {
                throw new RpcException("This scrim cannot hold any more groups");
            }
            output = nanoid(5).toLowerCase();
        }
        return output;
    }
}
