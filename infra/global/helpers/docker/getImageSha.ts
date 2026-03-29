import * as pulumi from "@pulumi/pulumi"
import axios from "axios";

const config = new pulumi.Config()

/**
 * @param namespace {string} Registry namespace (i.e. ghcr.io/namespace/repository:tag)
 * @param repository {string} Image name (i.e. namespace/repository:tag)
 * @param tag {string} Image Tag (i.e. namespace/repository:tag)
 */
export function getImageSha(namespace: string, repository: string, tag: string): pulumi.Output<string> {
    return pulumi.all([config.require("docker-username"), config.requireSecret("docker-access-token")]).apply(
        async ([username, pat]) => {
            const imageRef = `ghcr.io/${namespace}/${repository}:${tag}`
            const manifestResponse = await axios.get(`https://ghcr.io/v2/${namespace}/${repository}/manifests/${tag}`, {
                auth: {
                    username,
                    password: pat
                },
                headers: {
                    Accept: "application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.v2+json"
                }
            }).catch(e => {
                console.log(`Failed to look up ${namespace}/${repository}:${tag}`)
                throw e
            })

            const digest = manifestResponse.headers["docker-content-digest"]
            if (!digest || typeof digest !== "string") {
                throw new Error(`Digest header not found for ${imageRef}`)
            }

            console.log(`ghcr.io/${namespace}/${repository}@${digest} (${tag})`)
            return `ghcr.io/${namespace}/${repository}@${digest}`
        })

}
