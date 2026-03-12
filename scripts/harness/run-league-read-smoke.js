#!/usr/bin/env node

const path = require("path");
const {
    gqlRequest,
    requireEnv,
    resolvePrimaryToken,
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

const SCHEDULE_QUERY = `
  query {
    seasons: getScheduleGroups(type: "SEASON") {
      id
      description
      childGroups {
        id
        description
        start
        fixtures {
          id
          homeFranchise {
            profile {
              title
            }
          }
          awayFranchise {
            profile {
              title
            }
          }
        }
      }
    }
  }
`;

const FIXTURE_QUERY = `
  query Fixture($id: Float!) {
    fixture: getFixture(id: $id) {
      id
      scheduleGroup {
        description
      }
      homeFranchise {
        profile {
          title
        }
      }
      awayFranchise {
        profile {
          title
        }
      }
      matches {
        id
        submissionId
        submissionStatus
        canSubmit
        canRatify
        gameMode {
          description
        }
        skillGroup {
          profile {
            description
          }
        }
      }
    }
  }
`;

function chooseFixture(scheduleResponse, explicitFixtureId) {
    if (explicitFixtureId) {
        for (const season of scheduleResponse.seasons) {
            for (const group of season.childGroups) {
                const fixture = group.fixtures.find(candidate => Number(candidate.id) === explicitFixtureId);
                if (fixture) return fixture;
            }
        }
        throw new Error(`Fixture ${explicitFixtureId} was not found in the current schedule`);
    }

    for (const season of scheduleResponse.seasons) {
        for (const group of season.childGroups) {
            if (group.fixtures.length > 0) return group.fixtures[0];
        }
    }

    throw new Error("No fixtures were found in the league schedule");
}

async function main() {
    const apiUrl = requireEnv("HARNESS_API_URL");
    const stepDirectory = stepDir("tier1-league-read");
    const token = await resolvePrimaryToken({apiUrl, stepDirectory});

    const meResponse = await gqlRequest({
        apiUrl,
        token,
        query: ME_QUERY,
        stepDirectory,
        label: "me",
    });

    const scheduleResponse = await gqlRequest({
        apiUrl,
        token,
        query: SCHEDULE_QUERY,
        stepDirectory,
        label: "schedule",
    });

    if (!Array.isArray(scheduleResponse.seasons) || scheduleResponse.seasons.length === 0) {
        throw new Error("League schedule returned zero seasons");
    }

    const explicitFixtureId = process.env.HARNESS_FIXTURE_ID ? Number.parseInt(process.env.HARNESS_FIXTURE_ID, 10) : null;
    const fixture = chooseFixture(scheduleResponse, explicitFixtureId);

    const fixtureResponse = await gqlRequest({
        apiUrl,
        token,
        query: FIXTURE_QUERY,
        variables: {id: Number(fixture.id)},
        stepDirectory,
        label: "fixture",
    });

    if (!fixtureResponse.fixture) {
        throw new Error("Fixture query returned null");
    }

    if (!Array.isArray(fixtureResponse.fixture.matches) || fixtureResponse.fixture.matches.length === 0) {
        throw new Error("Fixture query returned no matches");
    }

    const summary = {
        status: "pass",
        actor: meResponse.me.profile.displayName,
        fixtureId: fixtureResponse.fixture.id,
        fixtureLabel: `${fixtureResponse.fixture.homeFranchise.profile.title} vs ${fixtureResponse.fixture.awayFranchise.profile.title}`,
        scheduleGroup: fixtureResponse.fixture.scheduleGroup.description,
        matchCount: fixtureResponse.fixture.matches.length,
        submissionStates: fixtureResponse.fixture.matches.map(match => ({
            matchId: match.id,
            submissionId: match.submissionId,
            submissionStatus: match.submissionStatus,
            canSubmit: match.canSubmit,
            canRatify: match.canRatify,
            gameMode: match.gameMode.description,
            skillGroup: match.skillGroup.profile.description,
        })),
    };

    writeSummary(stepDirectory, summary);
    console.log(`League read smoke passed for fixture ${summary.fixtureId}`);
}

main().catch(error => {
    const stepDirectory = stepDir("tier1-league-read");
    writeSummary(stepDirectory, {
        status: "fail",
        message: error.message,
        stack: error.stack || null,
    });
    console.error(error.message);
    process.exit(1);
});
