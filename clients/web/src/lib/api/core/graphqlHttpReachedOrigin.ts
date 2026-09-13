/**
 * True when an HTTP GraphQL operation reached Core (including GraphQL
 * application errors). False when the transport failed (504, failed fetch, etc.).
 */
export type OriginProbeResult = {
    error?: {
        networkError?: Error | null;
    } | null;
};

export function graphqlHttpReachedOrigin(result: OriginProbeResult | null | undefined): boolean {
    if (!result) return false;
    return !result.error?.networkError;
}
