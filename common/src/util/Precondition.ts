type Resolve = () => void;

export class Precondition {
    readonly resolve: Resolve;

    readonly promise: Promise<void>;

    constructor() {
        let r: Resolve;
        this.promise = new Promise<void>(resolve => {
            r = resolve;
        });
        // @ts-expect-error This class breaks rules.
        this.resolve = r;
    }
}
