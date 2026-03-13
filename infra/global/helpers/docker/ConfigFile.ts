import * as docker from "@pulumi/docker";
import * as pulumi from "@pulumi/pulumi";
import {readFileSync} from "fs";

export type ConfigFileArgs = Omit<docker.ServiceConfigArgs, "data"> & {
    transformation?: (x: string) => pulumi.Output<string>,
    filepath: string
}

export class ConfigFile extends docker.ServiceConfig {
    constructor(name: string, {filepath, transformation, ...args}: ConfigFileArgs, opts?: pulumi.CustomResourceOptions) {
        let data: string = readFileSync(filepath).toString();
        if (transformation) {
            super(name, {
                ...args,
                data: transformation(data).apply(d => btoa(d))
            }, opts)
        } else {
            super(name, {
                ...args,
                data: btoa(data)
            }, opts)
        }
    }
}