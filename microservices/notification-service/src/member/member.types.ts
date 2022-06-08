export interface Member {
    id: number;
}

export enum MemberRestrictionType {
    QUEUE_BAN = "QUEUE_BAN",
    RATIFICATION_BAN = "RATIFICATION_BAN",
}

export interface MemberRestriction {
    id: number;
    type: MemberRestrictionType;
    expiration: Date;
    reason: string;
    manualExpiration?: Date;
    manualExpirationReason?: string;
    member: Member;
}
