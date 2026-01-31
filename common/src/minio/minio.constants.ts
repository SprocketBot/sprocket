import {config} from "../util/config";

/**
 * Names of Minio buckets that fulfill certain purposes. Used in place of hardcoded
 * strings to refer to buckets.
 */
export const MINIO_BUCKETS = {
    replays: config.minio.bucketNames.replays,
};
