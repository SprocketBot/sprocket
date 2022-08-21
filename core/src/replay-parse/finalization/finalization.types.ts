import type {ScrimMeta} from "../../database";
import type {MLE_Scrim} from "../../database/mledb";

export interface SaveScrimFinalizationReturn {
    scrim: ScrimMeta;
    legacyScrim: MLE_Scrim;
}
