#!node_modules/.bin/ts-node

import { exec } from "child_process";

const WORKSPACES = [
    "common",
    "core",
    "clients/web",
    "clients/discord-bot",
    "microservices/image-generation-service",
    "microservices/matchmaking-service",
    "microservices/server-analytics-service"
];


const [tsNode, ...files] = process.argv

const dir = tsNode.replace("/node_modules/.bin/ts-node", "")

// Get unique array of files to lint
const toLint = [...new Set(files)]

const initial: Record<string, string[]> = {}
WORKSPACES.forEach(workspace => initial[workspace] = [])

const determineWorkspace = (file: string): string | null => {
    const relativePath = file.replace(`${dir}/`, "");
    for (const workspace of WORKSPACES) {
        if (relativePath.startsWith(workspace)) return workspace;
    }
    return null
}

const toLintByWorkspace = toLint.reduce<Record<string, string[]>>((acc, v) => {
    // Find matching workspace
    const workspace = determineWorkspace(v);
    if (workspace) {
        acc[workspace].push(v);
    }
    return acc;
}, initial);

const promises: Promise<void>[] = [];


for (const workspace of WORKSPACES) {
    const files = toLintByWorkspace[workspace];
    if (!files.length) continue;

    const p = new Promise<void>((resolve, reject) => {
        exec(`npm run lint --workspace=${workspace} -- --fix -c ${dir}/${workspace}/.eslintrc.cjs ${files.join(" ")}`,
            (err, stdout) => {
                if (err) {
                    console.log(stdout);
                    reject();
                } else {
                    resolve();
                }
            }
        );
    });

    promises.push(p);
}

Promise.allSettled(promises).then(results => {
    const failed = results.some(p => p.status === "rejected");
    if (failed) {
        process.exit(1);
    }
})
