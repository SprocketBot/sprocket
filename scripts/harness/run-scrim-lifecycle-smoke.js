#!/usr/bin/env node

const {
    gqlRequest,
    optionalBool,
    optionalCsv,
    optionalInt,
    poll,
    requireEnv,
    requireInt,
    requireMutationConfirmation,
    resolveScrimActors,
    stepDir,
    writeSummary,
} = require("./node-common");

const ME_QUERY = `
  query {
    me {
      id
      profile {
        displayName
      }
    }
  }
`;

const CURRENT_SCRIM_QUERY = `
  query {
    currentScrim: getCurrentScrim {
      id
      submissionId
      status
      playerCount
      maxPlayers
      players {
        id
        name
        checkedIn
      }
      settings {
        competitive
        mode
      }
      gameMode {
        description
      }
    }
  }
`;

const CREATE_SCRIM_MUTATION = `
  mutation CreateScrim(
    $gameModeId: Int!
    $settings: ScrimSettingsInput!
    $leaveAfter: Int!
    $createGroup: Boolean
  ) {
    createScrim(
      data: {
        gameModeId: $gameModeId
        settings: $settings
        createGroup: $createGroup
        leaveAfter: $leaveAfter
      }
    ) {
      id
      playerCount
      settings {
        competitive
        mode
      }
    }
  }
`;

const JOIN_SCRIM_MUTATION = `
  mutation JoinScrim($scrimId: String!, $leaveAfter: Int!, $createGroup: Boolean, $group: String) {
    joinScrim(scrimId: $scrimId, group: $group, createGroup: $createGroup, leaveAfter: $leaveAfter)
  }
`;

const CHECK_IN_MUTATION = `
  mutation {
    checkInToScrim
  }
`;

async function fetchCurrentScrim(apiUrl, token, stepDirectory, label) {
    return gqlRequest({
        apiUrl,
        token,
        query: CURRENT_SCRIM_QUERY,
        stepDirectory,
        label,
    });
}

function actorDisplayName(actor) {
    return actor.me?.me?.profile?.displayName || actor.label;
}

function ensureNoExistingScrim({allowExisting, actors}) {
    if (allowExisting) return;

    for (const actor of actors) {
        const scrim = actor.currentBefore?.currentScrim;
        if (!scrim) continue;

        if (scrim.status === "PENDING" && Number(scrim.playerCount) < Number(scrim.maxPlayers)) {
            throw new Error(
                `${actorDisplayName(actor)} is already in pending scrim ${scrim.id} ` +
                `with ${scrim.playerCount}/${scrim.maxPlayers} players. Clear that scrim or enable HARNESS_ALLOW_EXISTING_CURRENT_SCRIM=1 before rerun.`,
            );
        }

        throw new Error(`${actorDisplayName(actor)} is already in scrim ${scrim.id}`);
    }
}

async function main() {
    requireMutationConfirmation();

    const apiUrl = requireEnv("HARNESS_API_URL");
    const stepDirectory = stepDir("tier1-scrim-lifecycle");
    const actors = await resolveScrimActors({apiUrl, stepDirectory});
    if (actors.length < 2) {
        throw new Error("Scrim lifecycle smoke requires at least two actors");
    }

    const allowExisting = optionalBool("HARNESS_ALLOW_EXISTING_CURRENT_SCRIM", false);
    const gameModeId = requireInt("HARNESS_GAME_MODE_ID");
    const leaveAfter = optionalInt("HARNESS_LEAVE_AFTER", 1);
    const createGroup = optionalBool("HARNESS_CREATE_GROUP", false);
    const fallbackGroup = process.env.HARNESS_JOIN_GROUP || null;
    const actorGroups = optionalCsv("HARNESS_SCRIM_GROUP_ASSIGNMENTS");
    if (actorGroups.length > 0 && actorGroups.length !== actors.length) {
        throw new Error("HARNESS_SCRIM_GROUP_ASSIGNMENTS must match actor count when provided");
    }

    for (let index = 0; index < actors.length; index += 1) {
        const actor = actors[index];
        actor.group = actorGroups[index] || fallbackGroup;
        actor.me = await gqlRequest({
            apiUrl,
            token: actor.token,
            query: ME_QUERY,
            stepDirectory,
            label: `${actor.label}-me`,
        });
        actor.currentBefore = await fetchCurrentScrim(apiUrl, actor.token, stepDirectory, `${actor.label}-current-before`);
    }

    ensureNoExistingScrim({allowExisting, actors});

    const createResponse = await gqlRequest({
        apiUrl,
        token: actors[0].token,
        query: CREATE_SCRIM_MUTATION,
        variables: {
            gameModeId,
            leaveAfter,
            createGroup,
            settings: {
                mode: "TEAMS",
                competitive: true,
                observable: true,
                lfs: false,
            },
        },
        stepDirectory,
        label: "create-scrim",
    });

    const scrimId = createResponse.createScrim.id;
    for (let index = 1; index < actors.length; index += 1) {
        const actor = actors[index];
        const joinVariables = {
            scrimId,
            leaveAfter,
            createGroup,
        };
        if (actor.group) {
            joinVariables.group = actor.group;
        }

        await gqlRequest({
            apiUrl,
            token: actor.token,
            query: JOIN_SCRIM_MUTATION,
            variables: joinVariables,
            stepDirectory,
            label: `${actor.label}-join-scrim`,
        });
    }

    const attempts = optionalInt("HARNESS_SCRIM_POLL_ATTEMPTS", 10);
    const intervalMs = optionalInt("HARNESS_SCRIM_POLL_INTERVAL_MS", 2000);
    const expectedMaxPlayers = optionalInt("HARNESS_SCRIM_EXPECTED_MAX_PLAYERS", actors.length);
    const joinedPrimaryScrim = await poll(async attempt => {
        const response = await fetchCurrentScrim(apiUrl, actors[0].token, stepDirectory, `actor-1-current-post-join-${attempt + 1}`);
        const scrim = response.currentScrim;
        if (!scrim) throw new Error("Actor 1 has no current scrim after join");

        if (Number(scrim.maxPlayers) !== expectedMaxPlayers) {
            throw new Error(
                `Scrim ${scrim.id} expects ${scrim.maxPlayers} players, but the harness is configured for ${expectedMaxPlayers}.`,
            );
        }

        if (scrim.status === "PENDING" && Number(scrim.playerCount) < Number(scrim.maxPlayers)) {
            throw new Error(
                `Scrim ${scrim.id} is still pending with ${scrim.playerCount}/${scrim.maxPlayers} players. ` +
                "The configured actor set has not filled the scrim to its required player count.",
            );
        }

        if (["POPPED", "IN_PROGRESS"].includes(scrim.status)) {
            return scrim;
        }

        throw new Error(`Scrim has not reached a check-in state yet; current status=${scrim.status}`);
    }, {attempts, intervalMs});

    const requireCheckIn = optionalBool("HARNESS_REQUIRE_CHECKIN", true);
    if (requireCheckIn && joinedPrimaryScrim.status === "POPPED") {
        for (const actor of actors) {
            await gqlRequest({
                apiUrl,
                token: actor.token,
                query: CHECK_IN_MUTATION,
                stepDirectory,
                label: `${actor.label}-checkin`,
            });
        }
    }

    const finalPrimaryScrim = await poll(async attempt => {
        const response = await fetchCurrentScrim(apiUrl, actors[0].token, stepDirectory, `actor-1-current-after-${attempt + 1}`);
        const scrim = response.currentScrim;
        if (!scrim) throw new Error("Actor 1 has no current scrim after creation");

        if (["POPPED", "IN_PROGRESS"].includes(scrim.status)) {
            return scrim;
        }

        throw new Error(`Scrim has not progressed yet; current status=${scrim.status}`);
    }, {attempts, intervalMs});

    writeSummary(stepDirectory, {
        status: "pass",
        scrimId: finalPrimaryScrim.id,
        actors: actors.map(actor => ({
            label: actor.label,
            userId: actor.userId || null,
            displayName: actorDisplayName(actor),
        })),
        finalStatus: finalPrimaryScrim.status,
        submissionId: finalPrimaryScrim.submissionId || null,
        playerCount: finalPrimaryScrim.playerCount,
        maxPlayers: finalPrimaryScrim.maxPlayers,
        checkedInPlayers: finalPrimaryScrim.players.filter(player => player.checkedIn).map(player => player.name),
    });

    console.log(`Scrim lifecycle smoke passed for scrim ${finalPrimaryScrim.id} (${finalPrimaryScrim.status})`);
}

main().catch(error => {
    const stepDirectory = stepDir("tier1-scrim-lifecycle");
    writeSummary(stepDirectory, {
        status: "fail",
        message: error.message,
        stack: error.stack || null,
    });
    console.error(error.message);
    process.exit(1);
});
