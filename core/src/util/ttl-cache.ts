/**
 * An in-memory cache, entries expire after TTL.
 *
 * undefined == cache miss
 * Errors cause the cache to clear for the supplied key
 */
export class TtlCache<K, V> {
    private readonly store = new Map<K, {value: Promise<V>; expiresAt: number;}>();

    constructor(private readonly ttlMs: number) {}

    private get(key: K): Promise<V> | undefined {
        const entry = this.store.get(key);
        if (!entry) return undefined;
        if (entry.expiresAt <= Date.now()) {
            this.store.delete(key);
            return undefined;
        }
        return entry.value;
    }

    private set(key: K, value: Promise<V>): void {
        this.store.set(key, {value: value, expiresAt: Date.now() + this.ttlMs});
    }

    /**
     * cacheMissFn runs on cache miss
     * promise is returned
     */
    getOrLoad(key: K, cacheMissFn: () => Promise<V>): Promise<V> {
        const cached = this.get(key);
        if (cached !== undefined) return cached;

        const promise = cacheMissFn().catch((err: unknown) => {
            this.store.delete(key);
            throw err;
        });
        this.set(key, promise);
        return promise;
    }
}
