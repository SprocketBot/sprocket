const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const {GraphQLClient} = require("graphql-request");

function repoRoot() {
    return path.resolve(__dirname, "..", "..");
}

function utcTimestamp() {
    return new Date().toISOString();
}

function runId() {
    return process.env.HARNESS_RUN_ID || utcTimestamp().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function envName() {
    return process.env.HARNESS_ENV_NAME || "adhoc";
}

function artifactRoot() {
    const configured = process.env.HARNESS_ARTIFACT_ROOT || "artifacts/release-validation";
    return path.isAbsolute(configured) ? configured : path.join(repoRoot(), configured);
}

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, {recursive: true});
}

function runBaseDir() {
    const dir = path.join(artifactRoot(), envName(), runId());
    ensureDir(dir);
    writeRunMetadata(dir);
    return dir;
}

function stepDir(stepName) {
    const dir = path.join(runBaseDir(), stepName);
    ensureDir(dir);
    return dir;
}

function writeRunMetadata(baseDir) {
    const metadataPath = path.join(baseDir, "run-metadata.json");
    if (fs.existsSync(metadataPath)) return;

    const metadata = {
        environment: envName(),
        runId: runId(),
        timestamp: utcTimestamp(),
    };
    fs.writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
}

function writeJson(filePath, data) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(filePath, text) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, text.endsWith("\n") ? text : `${text}\n`);
}

function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

function optionalInt(name, fallback) {
    const value = process.env[name];
    if (!value) return fallback;
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
        throw new Error(`Environment variable ${name} must be an integer`);
    }
    return parsed;
}

function requireInt(name) {
    const value = requireEnv(name);
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
        throw new Error(`Environment variable ${name} must be an integer`);
    }
    return parsed;
}

function optionalBool(name, fallback) {
    const value = process.env[name];
    if (!value) return fallback;
    return ["1", "true", "yes", "y"].includes(value.toLowerCase());
}

function optionalCsv(name) {
    const value = process.env[name];
    if (!value) return [];
    return value.split(",").map(part => part.trim()).filter(Boolean);
}

function optionalIntList(name) {
    const values = optionalCsv(name);
    if (values.length === 0) return [];
    return values.map((value, index) => {
        const parsed = Number.parseInt(value, 10);
        if (Number.isNaN(parsed)) {
            throw new Error(`Environment variable ${name} contains a non-integer at position ${index + 1}`);
        }
        return parsed;
    });
}

function requireMutationConfirmation() {
    const value = process.env.HARNESS_MUTATION_CONFIRM;
    if (value !== "YES") {
        throw new Error("Refusing to run a mutating Tier 1 flow without HARNESS_MUTATION_CONFIRM=YES");
    }
}

async function sleep(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
}

async function poll(fn, {attempts, intervalMs}) {
    let lastError;
    for (let i = 0; i < attempts; i += 1) {
        try {
            return await fn(i);
        } catch (error) {
            lastError = error;
            if (i < attempts - 1) {
                await sleep(intervalMs);
            }
        }
    }
    throw lastError;
}

function gqlClient(apiUrl, token) {
    return new GraphQLClient(apiUrl, {
        headers: token ? {Authorization: `Bearer ${token}`} : {},
    });
}

function deriveRefreshUrl(apiUrl) {
    if (process.env.HARNESS_REFRESH_URL) {
        return process.env.HARNESS_REFRESH_URL;
    }

    if (apiUrl.endsWith("/graphql")) {
        return `${apiUrl.slice(0, -"/graphql".length)}/refresh`;
    }

    return `${apiUrl.replace(/\/$/, "")}/refresh`;
}

async function gqlRequest({apiUrl, token, query, variables, stepDirectory, label}) {
    const client = gqlClient(apiUrl, token);
    const requestPath = path.join(stepDirectory, `${label}.request.json`);
    const responsePath = path.join(stepDirectory, `${label}.response.json`);

    writeJson(requestPath, {
        apiUrl,
        variables: variables || null,
        query,
    });

    try {
        const data = await client.request(query, variables);
        writeJson(responsePath, {ok: true, data});
        return data;
    } catch (error) {
        writeJson(responsePath, {
            ok: false,
            message: error.message,
            response: error.response || null,
        });
        throw error;
    }
}

async function mintTokenForUser({apiUrl, adminToken, userId, organizationId, stepDirectory, label}) {
    const mutation = `
      mutation LoginAsUser($userId: Int!, $organizationId: Int) {
        loginAsUser(userId: $userId, organizationId: $organizationId)
      }
    `;

    const response = await gqlRequest({
        apiUrl,
        token: adminToken,
        query: mutation,
        variables: {
            userId,
            organizationId: organizationId || null,
        },
        stepDirectory,
        label,
    });

    return response.loginAsUser;
}

async function refreshAccessToken({apiUrl, refreshToken, stepDirectory, label}) {
    const refreshUrl = deriveRefreshUrl(apiUrl);
    const requestPath = path.join(stepDirectory, `${label}.request.json`);
    const responsePath = path.join(stepDirectory, `${label}.response.json`);

    writeJson(requestPath, {
        refreshUrl,
        authMode: "refresh-token",
    });

    const response = await fetch(refreshUrl, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${refreshToken}`,
        },
    });

    const rawBody = await response.text();
    let body;
    try {
        body = JSON.parse(rawBody);
    } catch (error) {
        writeJson(responsePath, {
            ok: false,
            status: response.status,
            statusText: response.statusText,
            bodyText: rawBody,
        });
        throw new Error(`Refresh token exchange returned non-JSON response: ${response.status} ${response.statusText}`);
    }

    writeJson(responsePath, {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        hasAccessToken: Boolean(body && body.access_token),
        hasRefreshToken: Boolean(body && body.refresh_token),
    });

    if (!response.ok) {
        throw new Error(`Refresh token exchange failed: ${response.status} ${response.statusText}`);
    }

    if (!body || !body.access_token) {
        throw new Error("Refresh token exchange succeeded without returning access_token");
    }

    return body.access_token;
}

async function resolveAdminToken({apiUrl, stepDirectory, label}) {
    if (process.env.HARNESS_ADMIN_BEARER_TOKEN) {
        return process.env.HARNESS_ADMIN_BEARER_TOKEN;
    }

    if (process.env.HARNESS_ADMIN_REFRESH_TOKEN) {
        return refreshAccessToken({
            apiUrl,
            refreshToken: process.env.HARNESS_ADMIN_REFRESH_TOKEN,
            stepDirectory,
            label,
        });
    }

    return null;
}

async function resolvePrimaryToken({apiUrl, stepDirectory}) {
    if (process.env.HARNESS_BEARER_TOKEN) {
        return process.env.HARNESS_BEARER_TOKEN;
    }

    if (process.env.HARNESS_REFRESH_TOKEN) {
        return refreshAccessToken({
            apiUrl,
            refreshToken: process.env.HARNESS_REFRESH_TOKEN,
            stepDirectory,
            label: "refresh-primary-token",
        });
    }

    const adminToken = await resolveAdminToken({
        apiUrl,
        stepDirectory,
        label: "refresh-admin-token",
    });
    if (adminToken && process.env.HARNESS_LOGIN_AS_USER_ID) {
        return mintTokenForUser({
            apiUrl,
            adminToken,
            userId: optionalInt("HARNESS_LOGIN_AS_USER_ID"),
            organizationId: optionalInt("HARNESS_ORGANIZATION_ID"),
            stepDirectory,
            label: "mint-primary-token",
        });
    }

    throw new Error(
        "Provide HARNESS_BEARER_TOKEN, HARNESS_REFRESH_TOKEN, or admin auth (HARNESS_ADMIN_BEARER_TOKEN or HARNESS_ADMIN_REFRESH_TOKEN) plus HARNESS_LOGIN_AS_USER_ID",
    );
}

async function resolveSecondaryToken({apiUrl, stepDirectory}) {
    if (process.env.HARNESS_SECONDARY_BEARER_TOKEN) {
        return process.env.HARNESS_SECONDARY_BEARER_TOKEN;
    }

    if (process.env.HARNESS_SECONDARY_REFRESH_TOKEN) {
        return refreshAccessToken({
            apiUrl,
            refreshToken: process.env.HARNESS_SECONDARY_REFRESH_TOKEN,
            stepDirectory,
            label: "refresh-secondary-token",
        });
    }

    const adminToken = await resolveAdminToken({
        apiUrl,
        stepDirectory,
        label: "refresh-admin-token",
    });
    if (adminToken && process.env.HARNESS_SECONDARY_USER_ID) {
        return mintTokenForUser({
            apiUrl,
            adminToken,
            userId: optionalInt("HARNESS_SECONDARY_USER_ID"),
            organizationId: optionalInt("HARNESS_ORGANIZATION_ID"),
            stepDirectory,
            label: "mint-secondary-token",
        });
    }

    return null;
}

async function resolveScrimActors({apiUrl, stepDirectory}) {
    const actorUserIds = optionalIntList("HARNESS_SCRIM_ACTOR_USER_IDS");
    if (actorUserIds.length > 0) {
        const actorBearerTokens = optionalCsv("HARNESS_SCRIM_ACTOR_BEARER_TOKENS");
        if (actorBearerTokens.length > 0 && actorBearerTokens.length !== actorUserIds.length) {
            throw new Error("HARNESS_SCRIM_ACTOR_BEARER_TOKENS must match HARNESS_SCRIM_ACTOR_USER_IDS in count");
        }

        if (actorBearerTokens.length > 0) {
            return actorUserIds.map((userId, index) => ({
                label: `actor-${index + 1}`,
                token: actorBearerTokens[index],
                userId,
            }));
        }

        const adminToken = await resolveAdminToken({
            apiUrl,
            stepDirectory,
            label: "refresh-admin-token",
        });
        if (!adminToken) {
            throw new Error(
                "Provide HARNESS_SCRIM_ACTOR_BEARER_TOKENS or admin auth (HARNESS_ADMIN_BEARER_TOKEN or HARNESS_ADMIN_REFRESH_TOKEN) for HARNESS_SCRIM_ACTOR_USER_IDS",
            );
        }

        const organizationId = optionalInt("HARNESS_ORGANIZATION_ID");
        const actors = [];
        for (let index = 0; index < actorUserIds.length; index += 1) {
            const userId = actorUserIds[index];
            const token = await mintTokenForUser({
                apiUrl,
                adminToken,
                userId,
                organizationId,
                stepDirectory,
                label: `mint-actor-${index + 1}-token`,
            });
            actors.push({
                label: `actor-${index + 1}`,
                token,
                userId,
            });
        }
        return actors;
    }

    const primaryToken = await resolvePrimaryToken({apiUrl, stepDirectory});
    const secondaryToken = await resolveSecondaryToken({apiUrl, stepDirectory});
    if (!secondaryToken) {
        throw new Error("Scrim lifecycle smoke requires HARNESS_SECONDARY_BEARER_TOKEN or HARNESS_SECONDARY_USER_ID");
    }

    return [
        {
            label: "actor-1",
            token: primaryToken,
            userId: optionalInt("HARNESS_LOGIN_AS_USER_ID", null),
        },
        {
            label: "actor-2",
            token: secondaryToken,
            userId: optionalInt("HARNESS_SECONDARY_USER_ID", null),
        },
    ];
}

function summaryPath(stepDirectory) {
    return path.join(stepDirectory, "summary.json");
}

function writeSummary(stepDirectory, summary) {
    writeJson(summaryPath(stepDirectory), {
        timestamp: utcTimestamp(),
        ...summary,
    });
}

module.exports = {
    envName,
    gqlRequest,
    optionalBool,
    optionalCsv,
    optionalInt,
    optionalIntList,
    requireInt,
    poll,
    requireEnv,
    requireMutationConfirmation,
    resolveAdminToken,
    resolvePrimaryToken,
    resolveScrimActors,
    resolveSecondaryToken,
    runBaseDir,
    sleep,
    stepDir,
    writeJson,
    writeSummary,
    writeText,
};
