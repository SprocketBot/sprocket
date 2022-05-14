import type {
    ScrimGameMode, ScrimPlayer, ScrimSettings,
} from "@sprocketbot/common";

export interface CreateScrimOpts {
    organizationId: number;
    settings: ScrimSettings;
    author?: ScrimPlayer;
    gameMode: ScrimGameMode;
    skillGroupId: number;
}
