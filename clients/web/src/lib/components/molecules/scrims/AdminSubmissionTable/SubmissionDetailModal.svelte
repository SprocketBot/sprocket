<script lang="ts">
    import {
        activeSubmissionsStore, resetSubmissionMutation, type Submission, reportMemberPlatformAccountMutation,
    } from "$lib/api";
    import {Modal} from "$lib/components";

    export let submission: Submission;
    export let visible = false;

    interface UnreportedAccount {
        name: string;
        platform: string;
        id: string;
    }

    interface VerifiedPlayer {
        name: string;
        id: number;
    }

    interface ExpectedPlayer {
        userId: number;
        name: string;
    }

    interface ReplayAccountPlayer {
        name: string;
        platform: string;
        id: string;
        userId: number | null;
    }

    interface TeamPlayers<TPlayer> {
        teamIndex: number;
        players: TPlayer[];
    }

    interface MismatchDetails {
        gameIndex: number;
        expectedParticipants: ExpectedPlayer[];
        expectedTeams: Array<TeamPlayers<ExpectedPlayer>>;
        foundTeams: Array<TeamPlayers<ReplayAccountPlayer>>;
        unexpectedRecognizedPlayers: ExpectedPlayer[];
        missingExpectedPlayers: ExpectedPlayer[];
    }

    interface RawDataPayload {
        unreported?: UnreportedAccount[];
        verified?: VerifiedPlayer[];
        mismatch?: MismatchDetails;
    }

    let unreportedAccounts: UnreportedAccount[] = [];
    let verifiedPlayers: VerifiedPlayer[] = [];
    let mismatchDetails: MismatchDetails | null = null;

    const parseRawData = (input?: string): RawDataPayload | null => {
        if (!input) return null;
        const match = input.match(/RawData: (\{.*\})/);
        if (!match) return null;
        try {
            return JSON.parse(match[1]) as RawDataPayload;
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    const applyRawData = (data: RawDataPayload | null): boolean => {
        if (!data) return false;
        if (data.unreported) unreportedAccounts = data.unreported;
        if (data.verified) verifiedPlayers = data.verified;
        if (data.mismatch) mismatchDetails = data.mismatch;
        return true;
    };

    // Parse error messages for unreported accounts
    $: {
        unreportedAccounts = [];
        verifiedPlayers = [];
        mismatchDetails = null;
        let found = false;

        if (submission.items) {
            for (const item of submission.items) {
                if (item.progress?.error) {
                    if (applyRawData(parseRawData(item.progress.error))) {
                        found = true;
                        break;
                    }
                }
            }
        }

        if (!found && submission.rejections) {
            for (const rejection of submission.rejections) {
                if (applyRawData(parseRawData(rejection.reason))) {
                    break;
                }
            }
        }
    }

    let linkingAccount: UnreportedAccount | null = null;
    let linkUserId: number | undefined;
    let linkOrgId: number = 2;
    let linkTracker: string = "TRN";

    // Generate TRN URL based on platform and ID
    const getTrnUrl = (platform: string, platformId: string): string => {
        const normalizedPlatform = platform.toUpperCase();
        switch (normalizedPlatform) {
            case "STEAM":
                return `https://rocketleague.tracker.network/rocket-league/profile/steam/${platformId}/overview`;
            case "EPIC":
                return `https://rocketleague.tracker.network/rocket-league/profile/epic/${platformId}/overview`;
            case "PS4":
            case "PSN":
                return `https://rocketleague.tracker.network/rocket-league/profile/psn/${platformId}/overview`;
            case "XBOX":
            case "XBL":
                return `https://rocketleague.tracker.network/rocket-league/profile/xbl/${platformId}/overview`;
            default:
                return "";
        }
    };

    const startLink = (acc: UnreportedAccount) => {
        linkingAccount = acc;
        linkUserId = undefined;
        const trnUrl = getTrnUrl(acc.platform, acc.id);
        linkTracker = trnUrl || "TRN";
    };

    const cancelLink = () => {
        linkingAccount = null;
    };

    const submitLink = async () => {
        if (!linkingAccount || !linkUserId) return;
        try {
            await reportMemberPlatformAccountMutation({
                userId: linkUserId,
                organizationId: linkOrgId,
                tracker: linkTracker,
                platform: linkingAccount.platform,
                platformId: linkingAccount.id,
            });
            alert("Reported successfully. Please Reset the submission to try again.");
            // eslint-disable-next-line require-atomic-updates
            linkingAccount = null;
        } catch (e) {
            alert(`Error reporting: ${e}`);
        }
    };

    const resetSubmission = async () => {
        await resetSubmissionMutation({submissionId: submission.id});

        // Close modal and refresh submissions table
        visible = false;
        activeSubmissionsStore.invalidate();
    };
</script>


<Modal title="Submission Detail" bind:visible id="submission-detail-modal">
    <div slot="body">
        {#if mismatchDetails}
            <div class="alert bg-warning text-warning-content shadow-lg mb-4">
                <div class="w-full">
                    <h3 class="font-bold text-base-100">Mismatched Players Detected</h3>
                    <p class="text-sm mt-1">Replay game #{Number(mismatchDetails.gameIndex) + 1} does not match expected scrim participants.</p>

                    {#if mismatchDetails.unexpectedRecognizedPlayers.length > 0}
                        <p class="text-sm mt-2"><span class="font-semibold">Unexpected recognized players:</span> {mismatchDetails.unexpectedRecognizedPlayers.map(p => `${p.name} (${p.userId})`).join(", ")}</p>
                    {/if}
                    {#if mismatchDetails.missingExpectedPlayers.length > 0}
                        <p class="text-sm mt-1"><span class="font-semibold">Missing expected players:</span> {mismatchDetails.missingExpectedPlayers.map(p => `${p.name} (${p.userId})`).join(", ")}</p>
                    {/if}

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                        <div class="overflow-x-auto">
                            <h4 class="font-semibold mb-2">Expected Teams</h4>
                            <table class="table table-compact w-full bg-base-100 text-base-content rounded-lg">
                                <thead>
                                    <tr>
                                        <th class="bg-base-200">Team</th>
                                        <th class="bg-base-200">Expected Players</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each mismatchDetails.expectedTeams as team}
                                        <tr>
                                            <td>Team {Number(team.teamIndex) + 1}</td>
                                            <td>{team.players.map(p => `${p.name} (${p.userId})`).join(", ")}</td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>

                        <div class="overflow-x-auto">
                            <h4 class="font-semibold mb-2">Found Replay Accounts</h4>
                            <table class="table table-compact w-full bg-base-100 text-base-content rounded-lg">
                                <thead>
                                    <tr>
                                        <th class="bg-base-200">Team</th>
                                        <th class="bg-base-200">Account</th>
                                        <th class="bg-base-200">Platform</th>
                                        <th class="bg-base-200">Account ID</th>
                                        <th class="bg-base-200">Recognized User</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each mismatchDetails.foundTeams as team}
                                        {#each team.players as player}
                                            <tr>
                                                <td>Team {Number(team.teamIndex) + 1}</td>
                                                <td>{player.name}</td>
                                                <td>{player.platform}</td>
                                                <td class="break-all max-w-xs">{player.id}</td>
                                                <td>{player.userId ?? "Unknown"}</td>
                                            </tr>
                                        {/each}
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        {/if}

        {#if unreportedAccounts.length > 0}
            <div class="alert bg-warning text-warning-content shadow-lg mb-4">
                <div class="w-full">
                    <h3 class="font-bold text-base-100">Unreported Accounts Detected</h3>
                    <div class="text-sm w-full overflow-x-auto">
                        <table class="table table-compact w-full bg-base-100 text-base-content rounded-lg">
                            <thead>
                                <tr>
                                    <th class="bg-base-200">Name</th>
                                    <th class="bg-base-200">Platform</th>
                                    <th class="bg-base-200">ID</th>
                                    <th class="bg-base-200">TRN Link</th>
                                    <th class="bg-base-200">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each unreportedAccounts as acc}
                                    <tr class="hover">
                                        <td class="break-words max-w-xs">{acc.name}</td>
                                        <td>{acc.platform}</td>
                                        <td class="break-all max-w-xs">{acc.id}</td>
                                        <td>
                                            {#if getTrnUrl(acc.platform, acc.id)}
                                                <a href={getTrnUrl(acc.platform, acc.id)} target="_blank" rel="noopener noreferrer" class="link link-primary text-xs">View Profile</a>
                                            {:else}
                                                <span class="text-xs text-base-300">N/A</span>
                                            {/if}
                                        </td>
                                        <td>
                                            <button class="btn btn-xs btn-primary" on:click={() => { startLink(acc) }}>Link</button>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {#if linkingAccount}
                <div class="card bg-base-200 p-4 mb-4">
                    <h4 class="font-bold mb-2">Link {linkingAccount.name} ({linkingAccount.platform})</h4>
                    {#if getTrnUrl(linkingAccount.platform, linkingAccount.id)}
                        <div class="alert alert-info shadow-sm mb-3">
                            <div class="flex flex-col w-full">
                                <span class="text-xs font-semibold">TRN Profile:</span>
                                <a href={getTrnUrl(linkingAccount.platform, linkingAccount.id)} target="_blank" rel="noopener noreferrer" class="link link-primary text-sm break-all">
                                    {getTrnUrl(linkingAccount.platform, linkingAccount.id)}
                                </a>
                            </div>
                        </div>
                    {/if}
                    <div class="flex flex-col gap-2">
                        <div class="form-control w-full max-w-xs">
                            <label class="label"><span class="label-text">Sprocket User ID</span></label>
                            <input type="number" bind:value={linkUserId} class="input input-bordered w-full max-w-xs" placeholder="e.g. 101" />
                        </div>
                        <div class="form-control w-full max-w-xs">
                            <label class="label"><span class="label-text">Organization ID</span></label>
                            <input type="number" bind:value={linkOrgId} class="input input-bordered w-full max-w-xs" />
                        </div>
                        <div class="form-control w-full max-w-xs">
                            <label class="label"><span class="label-text">Tracker</span></label>
                            <input type="text" bind:value={linkTracker} class="input input-bordered w-full max-w-xs" />
                        </div>
                        <div class="flex gap-2 mt-4">
                            <button class="btn btn-sm btn-success" on:click={submitLink}>Submit</button>
                            <button class="btn btn-sm btn-ghost" on:click={cancelLink}>Cancel</button>
                        </div>
                    </div>
                </div>
            {/if}

            {#if verifiedPlayers.length > 0}
                <div class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4">
                    <input type="checkbox" /> 
                    <div class="collapse-title text-xl font-medium">
                        Verified Players (Reference)
                    </div>
                    <div class="collapse-content">
                        <table class="table table-compact w-full">
                            <thead><tr><th>Name</th><th>Sprocket User ID</th></tr></thead>
                            <tbody>
                                {#each verifiedPlayers as p}
                                    <tr>
                                        <td>{p.name}</td>
                                        <td class="cursor-pointer hover:text-primary" on:click={() => { linkUserId = p.id }} title="Click to auto-fill User ID">{p.id}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            {/if}
        {/if}

        <div class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
            <input type="checkbox" />
            <div class="collapse-title text-xl font-medium">
                Raw Submission Data
            </div>
            <div class="collapse-content">
                <pre class="overflow-x-auto text-xs bg-base-200 p-4 rounded">{JSON.stringify(submission, null, 2)}</pre>
            </div>
        </div>
    </div>

    <div class="w-full flex flex-col justify-center" slot="actions">
        <button type="button" on:click={resetSubmission} class="btn btn-primary btn-wide flex mx-auto mb-4">Reset</button>
    </div>
</Modal>
