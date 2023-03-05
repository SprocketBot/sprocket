<script lang="ts">
    import {browser} from "$app/environment";
    import {MyOrganizationsStore, type MyOrganizations$result } from "$houdini";
    import {AuthGuard, Button} from "$lib/components";
    import { selectOrganization } from "../helpers";
    const orgStore = new MyOrganizationsStore();

    $: browser && orgStore.fetch();

    let loading: boolean;
    let value: number;
    let selectedOrg: MyOrganizations$result["me"]["organizations"][number] | undefined;

    $: if (value) selectedOrg = $orgStore.data?.me.organizations.find(o => o.id === value);

    $: loading = $orgStore.fetching && !$orgStore.data;
    $: if ($orgStore.data?.me.organizations.length === 1) {
        selectOrganization($orgStore.data.me.organizations[0].id, { next: "/app"});
    }


</script>
<AuthGuard behavior="login">
    {#if loading}
        Loading...
    {:else if $orgStore.data}
        <p class="text-center my-2 text-lg">Organization Selection:</p>
        <div class="grid grid-cols-1 gap-4">
            {#each $orgStore.data.me.organizations as org}
                <div class="flex justify-between items-center gap-2">
                    <img src={org.logoUrl} alt={org.name} class="w-16 h-16" />
                    <p class="text-sm text-center">{org.name}</p>
                    <Button variant="alt" size="sm" on:click={() => selectOrganization(org.id, {next: "/app"})}>
                        Select
                    </Button>
                </div>
            {/each}

        </div>
    {/if}
</AuthGuard>
