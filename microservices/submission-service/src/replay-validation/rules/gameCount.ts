import type {ValidationRule} from "../types/validation-rule";

export const gameCount: ValidationRule = (submission, scrim) => {
    if (!scrim.games) {
        throw new Error(`Unable to validate gameCount for scrim ${scrim.id} because it has no games`);
    }

    const submissionGameCount = submission.items.length;
    const scrimGameCount = scrim.games.length;

    if (submissionGameCount !== scrimGameCount) {
        return {
            valid: false,
            errors: [ {
                error: `Incorrect number of replays submitted, expected ${scrimGameCount} but found ${submissionGameCount}`,
            } ],
        };
    }

    return {valid: true};
};
