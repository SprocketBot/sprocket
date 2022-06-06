import {derived} from "svelte/store";
import {activeScrims, type ActiveScrimsStore} from "./ActiveScrims.store";

export interface Player {
    id: number;
    name: string;
    checkedIn: boolean;
}
export const activePlayers = derived<ActiveScrimsStore, Player[]>(activeScrims, $activeScrims => {
    let players: Player[];
    // eslint-disable-next-line prefer-const
    players = [];
    $activeScrims?.data?.activeScrims?.forEach(s => {
        s.players?.forEach(p => {
            players.push(p);
        });
    });
    // const players = $activeScrims?.data?.activeScrims?.flatMap(s => s.players) ?? [];
    return players;
});
