import * as pulumi from "@pulumi/pulumi";

export class SprocketStackDefinition {
    constructor(public readonly name: string,
        public readonly location: string) {
    }

    _stack: pulumi.StackReference | undefined

    get stack() {
        if (!this._stack)
            this._stack = new pulumi.StackReference(`gankoji/${this.name}/${this.name}`)
        return this._stack
    }
}