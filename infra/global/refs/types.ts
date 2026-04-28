import * as pulumi from "@pulumi/pulumi";

export class SprocketStackDefinition {
    constructor(
        public readonly name: string,
        public readonly location: string,
        private readonly stackConfigKey?: string,
    ) {
    }

    _stack: pulumi.StackReference | undefined
    _stackReferenceName: string | undefined

    get stack() {
        const configuredStackName = this.stackConfigKey
            ? new pulumi.Config().get(this.stackConfigKey)?.trim()
            : undefined;
        const stackName = configuredStackName || this.name;
        const stackReferenceName = `gankoji/${this.name}/${stackName}`;

        if (!this._stack || this._stackReferenceName !== stackReferenceName) {
            this._stack = new pulumi.StackReference(stackReferenceName);
            this._stackReferenceName = stackReferenceName;
        }

        return this._stack
    }
}