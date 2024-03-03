export abstract class BaseStore<T> {
    protected subscribers = new Set<(val: T) => unknown>();

    protected currentValue: T;

    subscribe(sub: (T) => unknown): () => void {
        this.subscribers.add(sub);
        sub(this.currentValue);
        return () => { this.cleanup(sub) };
    }

    protected pub(v?: T): void {
        if (v) this.currentValue = v;
        this.subscribers.forEach(sub => sub(this.currentValue));
    }

    protected cleanup(sub: (val: T) => unknown): void {
        this.subscribers.delete(sub);
    }

}
