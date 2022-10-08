<style lang="postcss">
</style>

<script lang="ts">
    import {type MemberRestriction, restrictedPlayers} from "$lib/api";

    import ManuallyExpireRestrictionModal from "../../organisms/scrims/modals/ManuallyExpireRestrictionModal.svelte";

    let restrictedPlayersData: MemberRestriction[] | undefined;
    $: restrictedPlayersData =
        $restrictedPlayers?.data?.getActiveMemberRestrictions;

    let expireRestrictionModalVisible = false;
    let targetRestriction: MemberRestriction;

    const openExpireRestrictionModal = (
        restriction: MemberRestriction,
    ): void => {
        expireRestrictionModalVisible = true;
        targetRestriction = restriction;
    };
</script>

<table class="table table-compact table-zebra text-center w-full">
    <thead>
        <tr>
            <th>Player Name</th>
            <th>Restriction ID</th>
            <th />
        </tr>
    </thead>
    <tbody>
        {#if restrictedPlayersData}
            {#each restrictedPlayersData as restrictionEvent (restrictionEvent.id)}
                <tr>
                    <td>{restrictionEvent.member.profile.name}</td>
                    <td>{restrictionEvent.id}</td>
                    <td>
                        <button
                            class="btn btn-outline lg:btn-sm"
                            on:click={() => {
                                openExpireRestrictionModal(restrictionEvent);
                            }}
                        >
                            Unban
                        </button>
                    </td>
                </tr>
            {/each}
        {/if}
    </tbody>
</table>

{#if expireRestrictionModalVisible}
    <ManuallyExpireRestrictionModal
        restriction={targetRestriction}
        bind:visible={expireRestrictionModalVisible}
    />
{/if}
