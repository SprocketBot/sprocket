import { derived } from "svelte/store";
import { activeScrims, type ActiveScrimsStore } from "./ActiveScrims.store";

export type Player = {
    id: number;
    name: string;
    checkedIn: boolean;
};
export const activePlayers = derived<ActiveScrimsStore, Array<Player>>(
    activeScrims, $activeScrims => {
        let players:Array<Player>;
        players = [];
        $activeScrims?.data?.activeScrims.forEach(s =>{
            s.players.forEach(p => {
                players.push(p)
            })
        });
        return players;
    }
)