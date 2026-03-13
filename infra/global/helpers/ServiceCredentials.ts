import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";

const defaultPasswordOptions: random.RandomPasswordArgs = {
    length: 64,
    upper: true,
    lower: true,
    special: false,
    number: true
}

export interface ServiceCredentialsArgs {
    passwordOptions?: Partial<random.RandomPasswordArgs>,
    username: string,
}

export class ServiceCredentials extends pulumi.ComponentResource {

    readonly username: pulumi.Output<string>
    readonly password: pulumi.Output<string>
    readonly passwordResource: random.RandomPassword

    constructor(name: string, args: ServiceCredentialsArgs, opts?: pulumi.ComponentResourceOptions) {
        super("SprocketBot:Components:ServiceCredentials", name, {}, opts)

        this.passwordResource = new random.RandomPassword(`${name}-password`, {...defaultPasswordOptions, ...args.passwordOptions}, {parent: this})

        this.username = pulumi.output(args.username)
        this.password = this.passwordResource.result as pulumi.Output<string>

    }
}
