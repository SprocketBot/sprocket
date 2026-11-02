import {config} from "@sprocketbot/common";

export const REDIS_PREFIX = `${config.redis.prefix}:submission`;

// Deliberately not under REDIS_PREFIX: getAllSubmissions scans `${REDIS_PREFIX}:*` and
// reads every match as a JSON submission, so a lock key there would break that scan.
export const SUBMISSION_LOCK_PREFIX = `${config.redis.prefix}:submission-lock`;
