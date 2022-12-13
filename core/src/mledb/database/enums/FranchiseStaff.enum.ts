export enum FranchiseStaff {
    FRANCHISE_MANAGER = 1,
    GENERAL_MANAGER = 2,
    ASSISTANT_GENERAL_MANAGER = 3,
    CAPTAIN = 4,
    PR_SUPPORT = 5,
    NONE = 6,
}

export function positionToString(position: FranchiseStaff): string {
    switch (position) {
        case FranchiseStaff.FRANCHISE_MANAGER:
            return "franchise manager";
        case FranchiseStaff.GENERAL_MANAGER:
            return "general manager";
        case FranchiseStaff.ASSISTANT_GENERAL_MANAGER:
            return "assistant general manager";
        case FranchiseStaff.CAPTAIN:
            return "captain";
        case FranchiseStaff.PR_SUPPORT:
            return "pr support";
        case FranchiseStaff.NONE:
        default:
            return "none";
    }
}

export function stringToPosition(name: string): FranchiseStaff {
    switch (name.toLowerCase()) {
        case "franchise manager":
            return FranchiseStaff.FRANCHISE_MANAGER;
        case "general manager":
            return FranchiseStaff.GENERAL_MANAGER;
        case "assistant general manager":
            return FranchiseStaff.ASSISTANT_GENERAL_MANAGER;
        case "captain":
            return FranchiseStaff.CAPTAIN;
        case "pr support":
            return FranchiseStaff.PR_SUPPORT;
        default:
            return FranchiseStaff.NONE;
    }
}

export function positionToStringAbbr(position: FranchiseStaff): string {
    switch (position) {
        case FranchiseStaff.FRANCHISE_MANAGER:
            return "fm";
        case FranchiseStaff.GENERAL_MANAGER:
            return "gm";
        case FranchiseStaff.ASSISTANT_GENERAL_MANAGER:
            return "agm";
        case FranchiseStaff.CAPTAIN:
            return "capt";
        case FranchiseStaff.PR_SUPPORT:
            return "pr";
        case FranchiseStaff.NONE:
        default:
            return "none";
    }
}
