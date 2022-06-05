<script lang="ts">
    import {
        restrictedPlayers, type MemberRestrictionEvent, expireRestrictionMutation,
    } from "$lib/api";

    let restrictedPlayersData: MemberRestrictionEvent[] | undefined;
    $: restrictedPlayersData = $restrictedPlayers?.data?.getActiveMemberRestrictions;

    async function cancelRestriction(id: number) {
        try {
            await expireRestrictionMutation({id: id ?? 0, expiration: new Date()});
        } catch {
            console.log(`Failed to cancel the restriction for member ${id}`);
        }
    }

    const unbanThisPlayer = async (restrictionId: number) => {
        await cancelRestriction(restrictionId);
    };
</script>

<table class="table text-center w-full" >
    <thead>
    <tr>
        <th>Player Name</th>
        <th>Restriction ID</th>
        <th></th>
    </tr>
    </thead>
    <tbody>
        {#if restrictedPlayersData}
            {#each restrictedPlayersData as restriction (restriction.id)}
                <tr>
                    <td>{restriction.member.profile.name}</td>
                    <td>{restriction.id}</td>
                    <td>
                        <button class="btn btn-outline lg:btn-sm" on:click={async () => unbanThisPlayer(restriction.id) }>
                            Unban
                        </button>
                    </td>
                </tr>
            {/each}
        {/if}
    </tbody>
</table>

<style lang="postcss">
</style>
