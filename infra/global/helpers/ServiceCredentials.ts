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
    password?: pulumi.Input<string>,
    username: string,
}

export class ServiceCredentials extends pulumi.ComponentResource {

    readonly username: pulumi.Output<string>
    readonly password: pulumi.Output<string>
    readonly passwordResource?: random.RandomPassword

    constructor(name: string, args: ServiceCredentialsArgs, opts?: pulumi.ComponentResourceOptions) {
        super("SprocketBot:Components:ServiceCredentials", name, {}, opts)

        this.username = pulumi.output(args.username)
        if (args.password) {
            this.password = pulumi.output(args.password)
        } else {
            this.passwordResource = new random.RandomPassword(`${name}-password`, {...defaultPasswordOptions, ...args.passwordOptions}, {parent: this})
            this.password = this.passwordResource.result as pulumi.Output<string>
        }

    }
}
