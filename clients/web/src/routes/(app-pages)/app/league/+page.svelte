<script lang="ts">
    import {UserProfileStore, LeagueMatchesStore, type LeagueMatches$result} from "$houdini";
    import {onMount} from "svelte";

    const profileStore = new UserProfileStore();

    onMount(() => {
        profileStore.fetch();
    });
    
    let matchData: LeagueMatches$result;
    
    const matchStore = new LeagueMatchesStore();
    const loadData = async () => {
        console.log("Loading league match data.");
        const queryResult = await matchStore.fetch();
        if (queryResult.data) {
            matchData = queryResult.data;
        } else {
            throw new Error("Could not load the match data.");
        }
    }

</script>

{#await loadData()}
    Fetching data, please wait. 
{:then}
    Here's that data you ordered, sir. 
    {#each matchData.season as s}
        <div>
            {s.description}
            {#each s.childGroups as sg}
                <div>{sg.description}</div>
                <div>{sg.start}</div>
                {#each sg.fixtures as sf} 
                    <div>{sf.awayFranchise.profile.title} @ {sf.homeFranchise.profile.title}</div>
                    <img src={sf.awayFranchise.profile.photo.url} />
                    <img src={sf.homeFranchise.profile.photo.url} />
                {/each}
            {/each}           
        </div>
    {/each}

{:catch someError}
    System error: {someError.message}
{/await}