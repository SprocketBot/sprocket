import type {MLE_Scrim, MLE_Series} from "../../mledb/database";
import type {Match} from "../database/match.entity";
import type {ScrimMeta} from "../database/scrim-meta.entity";

export interface SaveScrimFinalizationReturn {
    scrim: ScrimMeta;
    legacyScrim: MLE_Scrim;
}

export interface SaveMatchFinalizationReturn {
    match: Match;
    legacyMatch: MLE_Series;
}
