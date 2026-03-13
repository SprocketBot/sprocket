#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const {
    gqlRequest,
    optionalBool,
    optionalInt,
    poll,
    requireEnv,
    requireMutationConfirmation,
    resolveAdminToken,
    resolvePrimaryToken,
    stepDir,
    writeJson,
    writeSummary,
} = require("./node-common");

const fetchImpl = globalThis.fetch;
const FormDataImpl = globalThis.FormData;
const BlobImpl = globalThis.Blob;

if (!fetchImpl || !FormDataImpl || !BlobImpl) {
    throw new Error("Replay submission harness requires Node.js globals: fetch, FormData, and Blob");
}

const CURRENT_SCRIM_QUERY = `
  query {
    currentScrim: getCurrentScrim {
      id
      submissionId
      status
    }
  }
`;

const SUBMISSION_QUERY = `
  query Submission($submissionId: String!) {
    submission: getSubmission(submissionId: $submissionId) {
      id
      status
      validated
      ratifications
      requiredRatifications
      items {
        originalFilename
        progress {
          status
          error
          taskId
        }
      }
    }
  }
`;

const MOCK_COMPLETION_MUTATION = `
  mutation MockCompletion($submissionId: String!, $results: [JSON!]!) {
    mockCompletion(submissionId: $submissionId, results: $results)
  }
`;

function replayPaths() {
    const configured = requireEnv("HARNESS_REPLAY_FILE_PATHS");
    return configured.split(",").map(value => value.trim()).filter(Boolean);
}

function buildMockResults(filePaths) {
    return filePaths.map((filePath, index) => {
        const filename = path.basename(filePath, path.extname(filePath)) || `replay-${index + 1}`;
        return {
            outputPath: `replays/mock/${filename}.json`,
            parser: "BALLCHASING",
            data: {
                blue: {
                    stats: {core: {goals: 3}},
                    players: [
                        {name: "BluePlayer1", id: {platform: "STEAM", id: "76561198012345678"}, stats: {core: {goals: 2}}},
                        {name: "BluePlayer2", id: {platform: "STEAM", id: "76561198087654321"}, stats: {core: {goals: 1}}},
                    ],
                },
                orange: {
                    stats: {core: {goals: 1}},
                    players: [
                        {name: "OrangePlayer1", id: {platform: "STEAM", id: "76561198055555555"}, stats: {core: {goals: 1}}},
                        {name: "OrangePlayer2", id: {platform: "STEAM", id: "76561198044444444"}, stats: {core: {goals: 0}}},
                    ],
                },
            },
        };
    });
}

async function uploadReplays({apiUrl, token, submissionId, filePaths, stepDirectory}) {
    const formData = new FormDataImpl();
    const operations = {
        query: `
          mutation ParseReplays($files: [Upload!]!, $submissionId: String!) {
            parseReplays(files: $files, submissionId: $submissionId)
          }
        `,
        variables: {
            files: filePaths.map(() => null),
            submissionId,
        },
    };

    const map = {};
    filePaths.forEach((_, index) => {
        map[String(index)] = [`variables.files.${index}`];
    });

    formData.append("operations", JSON.stringify(operations));
    formData.append("map", JSON.stringify(map));

    filePaths.forEach((filePath, index) => {
        const fileBuffer = fs.readFileSync(filePath);
        const file = new BlobImpl([fileBuffer], {type: "application/octet-stream"});
        formData.append(String(index), file, path.basename(filePath));
    });

    const response = await fetchImpl(apiUrl, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    const rawBody = await response.text();
    let json;
    try {
        json = JSON.parse(rawBody);
    } catch (error) {
        writeJson(path.join(stepDirectory, "upload.response.json"), {
            ok: false,
            status: response.status,
            statusText: response.statusText,
            bodyText: rawBody,
        });
        throw new Error(`Replay upload returned non-JSON response: ${response.status} ${response.statusText}`);
    }

    writeJson(path.join(stepDirectory, "upload.response.json"), {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        body: json,
    });

    if (!response.ok) {
        throw new Error(`Replay upload failed: ${response.status} ${response.statusText}`);
    }

    if (json.errors) {
        throw new Error(`Replay upload failed: ${JSON.stringify(json.errors)}`);
    }

    return json.data.parseReplays;
}

async function main() {
    requireMutationConfirmation();

    const apiUrl = requireEnv("HARNESS_API_URL");
    const stepDirectory = stepDir("tier1-replay-submission");
    const primaryToken = await resolvePrimaryToken({apiUrl, stepDirectory});

    let submissionId = process.env.HARNESS_SUBMISSION_ID || "";
    if (!submissionId) {
        const currentScrim = await gqlRequest({
            apiUrl,
            token: primaryToken,
            query: CURRENT_SCRIM_QUERY,
            stepDirectory,
            label: "current-scrim",
        });
        submissionId = currentScrim.currentScrim?.submissionId || "";
    }

    if (!submissionId) {
        throw new Error("Provide HARNESS_SUBMISSION_ID or ensure the current scrim has a submissionId");
    }

    const before = await gqlRequest({
        apiUrl,
        token: primaryToken,
        query: SUBMISSION_QUERY,
        variables: {submissionId},
        stepDirectory,
        label: "submission-before",
    });

    const filePaths = replayPaths();
    const taskIds = await uploadReplays({
        apiUrl,
        token: primaryToken,
        submissionId,
        filePaths,
        stepDirectory,
    });

    const attempts = optionalInt("HARNESS_SUBMISSION_POLL_ATTEMPTS", 10);
    const intervalMs = optionalInt("HARNESS_SUBMISSION_POLL_INTERVAL_MS", 2000);
    const acceptedStatuses = new Set(["PROCESSING", "VALIDATING", "RATIFYING", "REJECTED"]);

    const afterUpload = await poll(async attempt => {
        const response = await gqlRequest({
            apiUrl,
            token: primaryToken,
            query: SUBMISSION_QUERY,
            variables: {submissionId},
            stepDirectory,
            label: `submission-after-${attempt + 1}`,
        });

        const submission = response.submission;
        if (!submission) {
            throw new Error("Submission query returned null after upload");
        }

        if ((submission.items && submission.items.length > 0) || acceptedStatuses.has(submission.status)) {
            return submission;
        }

        throw new Error(`Submission has not reflected uploaded files yet; status=${submission.status}`);
    }, {attempts, intervalMs});

    let mockCompletionUsed = false;
    if (optionalBool("HARNESS_USE_MOCK_COMPLETION", false)) {
        const adminToken = await resolveAdminToken({
            apiUrl,
            stepDirectory,
            label: "refresh-admin-token",
        });
        if (!adminToken) {
            throw new Error("HARNESS_USE_MOCK_COMPLETION requires HARNESS_ADMIN_BEARER_TOKEN or HARNESS_ADMIN_REFRESH_TOKEN");
        }

        await gqlRequest({
            apiUrl,
            token: adminToken,
            query: MOCK_COMPLETION_MUTATION,
            variables: {
                submissionId,
                results: buildMockResults(filePaths),
            },
            stepDirectory,
            label: "mock-completion",
        });
        mockCompletionUsed = true;
    }

    writeSummary(stepDirectory, {
        status: "pass",
        submissionId,
        taskIds,
        statusBefore: before.submission ? before.submission.status : null,
        statusAfter: afterUpload.status,
        itemCountAfter: afterUpload.items.length,
        mockCompletionUsed,
    });

    console.log(`Replay submission smoke passed for submission ${submissionId}`);
}

main().catch(error => {
    const stepDirectory = stepDir("tier1-replay-submission");
    writeSummary(stepDirectory, {
        status: "fail",
        message: error.message,
        stack: error.stack || null,
    });
    console.error(error.message);
    process.exit(1);
});
