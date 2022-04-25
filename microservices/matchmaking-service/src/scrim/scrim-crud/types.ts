import type {
    ScrimGameMode, ScrimPlayer, ScrimSettings,
} from "@sprocketbot/common";

export interface CreateScrimOpts {
    settings: ScrimSettings;
    author?: ScrimPlayer;
    gameMode: ScrimGameMode;
}
