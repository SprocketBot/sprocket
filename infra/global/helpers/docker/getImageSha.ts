import * as pulumi from "@pulumi/pulumi"
import axios from "axios";

const config = new pulumi.Config()

/**
 * @param namespace {string} Dockerhub username (i.e. namespace/repository:tag)
 * @param repository {string} Image name (i.e. namespace/repository:tag)
 * @param tag {string} Image Tag (i.e. namespace/repository:tag)
 */
export function getImageSha(namespace: string, repository: string, tag: string): pulumi.Output<string> {
    return pulumi.all([config.require("docker-username"), config.requireSecret("docker-access-token")]).apply(
        async ([username, pat]) => {
            const tokenResponse = await axios.post("https://hub.docker.com/v2/users/login", {
                "username": username, "password": pat
            }, {
                headers: {
                    "Content-Type": "application/json"
                },
            }).catch(e => {
                console.log(`Failed to look up ${namespace}/${repository}:${tag}`)
                throw e
            })
            const token = tokenResponse.data.token


            const result = await axios.get<unknown>(`https://hub.docker.com/v2/namespaces/${namespace}/repositories/${repository}/tags/${tag}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).catch(e => {
                console.log(`Failed to look up ${namespace}/${repository}:${tag}`)
                throw e
            })

            const {data} = result;
            if (!data || typeof data !== "object" || !data) throw new Error(`Tag not found! ${namespace}/${repository}:${tag}`)
            if (!("digest" in data)) throw new Error(`Tag not found! ${namespace}/${repository}:${tag}`)
            // @ts-ignore
            const {digest} = data;

            // if (!result) throw new Error(`Tag not found! ${namespace}/${repository}:${tag}`)
            console.log(`${namespace}/${repository}@${digest} (${tag})`)
            return `${namespace}/${repository}@${digest}`
        })

}
