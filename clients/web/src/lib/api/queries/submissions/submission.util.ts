import type {Submission} from "./submission.types";

/**
 * Determines if two submissions are "equal" by comparing their scrimId/matchId. Submissions don't have an id themselves so we can't compare by that.
 * scrimId and matchId should both be unique, so we can use those properties. Both should be equal, whether a string value or undefined.
 * @returns True if both submissions have matching scrimId/matchId. False otherwise.
 */
export const submissionsEqual = (sub1: Submission, sub2: Submission): boolean => sub1.scrimId === sub2.scrimId && sub1.matchId === sub2.matchId;
