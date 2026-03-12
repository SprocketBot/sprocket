#!/usr/bin/env node

const {
    gqlRequest,
    optionalBool,
    optionalInt,
    poll,
    requireEnv,
    requireInt,
    requireMutationConfirmation,
    resolvePrimaryToken,
    resolveSecondaryToken,
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

async function main() {
    requireMutationConfirmation();

    const apiUrl = requireEnv("HARNESS_API_URL");
    const stepDirectory = stepDir("tier1-scrim-lifecycle");
    const primaryToken = await resolvePrimaryToken({apiUrl, stepDirectory});
    const secondaryToken = await resolveSecondaryToken({apiUrl, stepDirectory});

    if (!secondaryToken) {
        throw new Error("Scrim lifecycle smoke requires HARNESS_SECONDARY_BEARER_TOKEN or HARNESS_SECONDARY_USER_ID");
    }

    const allowExisting = optionalBool("HARNESS_ALLOW_EXISTING_CURRENT_SCRIM", false);
    const gameModeId = requireInt("HARNESS_GAME_MODE_ID");
    const leaveAfter = optionalInt("HARNESS_LEAVE_AFTER", 1);
    const createGroup = optionalBool("HARNESS_CREATE_GROUP", false);
    const group = process.env.HARNESS_JOIN_GROUP || null;

    const primaryMe = await gqlRequest({
        apiUrl,
        token: primaryToken,
        query: ME_QUERY,
        stepDirectory,
        label: "primary-me",
    });

    const secondaryMe = await gqlRequest({
        apiUrl,
        token: secondaryToken,
        query: ME_QUERY,
        stepDirectory,
        label: "secondary-me",
    });

    const primaryBefore = await fetchCurrentScrim(apiUrl, primaryToken, stepDirectory, "primary-current-before");
    const secondaryBefore = await fetchCurrentScrim(apiUrl, secondaryToken, stepDirectory, "secondary-current-before");

    if (!allowExisting && primaryBefore.currentScrim) {
        throw new Error(`Primary actor ${primaryMe.me.profile.displayName} is already in scrim ${primaryBefore.currentScrim.id}`);
    }

    if (!allowExisting && secondaryBefore.currentScrim) {
        throw new Error(`Secondary actor ${secondaryMe.me.profile.displayName} is already in scrim ${secondaryBefore.currentScrim.id}`);
    }

    const createResponse = await gqlRequest({
        apiUrl,
        token: primaryToken,
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

    await gqlRequest({
        apiUrl,
        token: secondaryToken,
        query: JOIN_SCRIM_MUTATION,
        variables: {
            scrimId,
            leaveAfter,
            createGroup,
            group,
        },
        stepDirectory,
        label: "join-scrim",
    });

    const requireCheckIn = optionalBool("HARNESS_REQUIRE_CHECKIN", true);
    if (requireCheckIn) {
        await gqlRequest({
            apiUrl,
            token: primaryToken,
            query: CHECK_IN_MUTATION,
            stepDirectory,
            label: "primary-checkin",
        });

        await gqlRequest({
            apiUrl,
            token: secondaryToken,
            query: CHECK_IN_MUTATION,
            stepDirectory,
            label: "secondary-checkin",
        });
    }

    const attempts = optionalInt("HARNESS_SCRIM_POLL_ATTEMPTS", 10);
    const intervalMs = optionalInt("HARNESS_SCRIM_POLL_INTERVAL_MS", 2000);

    const finalPrimaryScrim = await poll(async attempt => {
        const response = await fetchCurrentScrim(apiUrl, primaryToken, stepDirectory, `primary-current-after-${attempt + 1}`);
        const scrim = response.currentScrim;
        if (!scrim) throw new Error("Primary actor has no current scrim after creation");

        if (["POPPED", "IN_PROGRESS"].includes(scrim.status)) {
            return scrim;
        }

        throw new Error(`Scrim has not progressed yet; current status=${scrim.status}`);
    }, {attempts, intervalMs});

    writeSummary(stepDirectory, {
        status: "pass",
        scrimId: finalPrimaryScrim.id,
        primaryActor: primaryMe.me.profile.displayName,
        secondaryActor: secondaryMe.me.profile.displayName,
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
