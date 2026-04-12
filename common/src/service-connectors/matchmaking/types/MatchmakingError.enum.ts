export enum MatchmakingError {
    PlayerAlreadyInScrim = "PlayerAlreadyInScrim",
    PlayerNotInScrim = "PlayerNotInScrim",
    PlayerAlreadyCheckedIn = "PlayerAlreadyCheckedIn",
    ScrimGroupNotSupportedInMode = "ScrimGroupNotSupportedInMode",
    ScrimNotFound = "ScrimNotFound",
    ScrimAlreadyInProgress = "ScrimAlreadyInProgress",
    ScrimStatusNotPopped = "ScrimStatusNotPopped",
    ScrimSubmissionNotFound = "ScrimSubmissionNotFound",
    MaxGroupsCreated = "MaxGroupsCreated",
    GroupNotFound = "GroupNotFound",
    GroupFull = "GroupFull",
    /** Ungrouped joins blocked briefly after the first team group is created (team scrims). */
    ScrimGroupInviteWindowActive = "ScrimGroupInviteWindowActive",
}
