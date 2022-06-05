<script lang="ts">
    import {activePlayers, type Player} from "$lib/api";
    import {restrictedPlayers, type MemberRestrictionEvent, expireRestrictionMutation} from "$lib/api";

    //export let visible = false;
    let restrictedPlayersData: MemberRestrictionEvent[] | undefined;
    $: restrictedPlayersData = $restrictedPlayers?.data?.getActiveMemberRestrictions;

    let targetRestriction:number;

    const unbanThisPlayer = (restrictionId: number) => {
        targetRestriction = restrictionId;
        console.log(`Unbanning ${restrictionId}`);
        cancelRestriction(restrictionId);
    }

    function cancelRestriction(id:number) {
        try {
            expireRestrictionMutation({id: id?? 0, expiration: new Date()});
        } catch {
            console.log("oops, all berries!")
        }
    }
</script>

<table class="table text-center w-full" >
    <thead>
    <tr>
<!--        <th>Ban Status</th>-->
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
                        <button class="btn btn-outline lg:btn-sm" on:click={() => {unbanThisPlayer(restriction.id)}}>
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