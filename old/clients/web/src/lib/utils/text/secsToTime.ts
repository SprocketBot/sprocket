export const secsToTime = (secs: number): string => new Date(1000 * secs).toISOString()
    .substr(11, 8);
