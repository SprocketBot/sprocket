import { ScrimMeta } from "../../database/scheduling/saved_scrim/scrim.model";
import { Match } from "../../database/scheduling/match/match.model";
import type { MLE_Scrim, MLE_Series } from "../../database/mledb";

export interface SaveScrimFinalizationReturn {
    scrim: ScrimMeta;
    legacyScrim: MLE_Scrim;
}

export interface SaveMatchFinalizationReturn {
    match: Match;
    legacyMatch: MLE_Series;
}
