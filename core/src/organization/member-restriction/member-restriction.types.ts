import type {FindOperator} from "typeorm";

import type {MemberRestrictionType} from "../../database";

export interface MemberRestrictionFindOperation {
    type: MemberRestrictionType;
    expiration?: FindOperator<Date>;
    manualExpiration: FindOperator<unknown>;
    member?: {id: number;};
}
