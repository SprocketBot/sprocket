import * as docker from "@pulumi/docker"
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

export const DockerProvider = new docker.Provider("authenticated-docker", {
    registryAuth: [
        {
            address: "registry.hub.docker.com",
            username: config.require("docker-username"),
            password: config.require("docker-access-token"),
        }
    ]
})