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

    let unreportedAccounts: UnreportedAccount[] = [];
    let verifiedPlayers: VerifiedPlayer[] = [];

    // Parse error messages for unreported accounts
    $: {
        unreportedAccounts = [];
        verifiedPlayers = [];
        let found = false;

        if (submission.items) {
            for (const item of submission.items) {
                if (item.progress?.error) {
                    const match = item.progress.error.match(/RawData: (\{.*\})/);
                    if (match) {
                        try {
                            const data = JSON.parse(match[1]);
                            if (data.unreported) unreportedAccounts = data.unreported;
                            if (data.verified) verifiedPlayers = data.verified;
                            found = true;
                            break;
                        } catch (e) { console.error(e) }
                    }
                }
            }
        }

        if (!found && submission.rejections) {
            for (const rejection of submission.rejections) {
                const match = rejection.reason.match(/RawData: (\{.*\})/);
                if (match) {
                    try {
                        const data = JSON.parse(match[1]);
                        if (data.unreported) unreportedAccounts = data.unreported;
                        if (data.verified) verifiedPlayers = data.verified;
                        break;
                    } catch (e) { console.error(e) }
                }
            }
        }
    }

    let linkingAccount: UnreportedAccount | null = null;
    let linkUserId: number | undefined;
    let linkOrgId: number = 2;
    let linkTracker: string = "TRN";

    const startLink = (acc: UnreportedAccount) => {
        linkingAccount = acc;
        linkUserId = undefined;
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
                            <thead><tr><th>Name</th><th>User ID</th></tr></thead>
                            <tbody>
                                {#each verifiedPlayers as p}
                                    <tr>
                                        <td>{p.name}</td>
                                        <td class="cursor-pointer hover:text-primary" on:click={() => { linkUserId = p.id }} title="Click to use ID">{p.id}</td>
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