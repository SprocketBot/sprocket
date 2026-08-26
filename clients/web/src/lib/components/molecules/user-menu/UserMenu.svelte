<script lang='ts'>
    import {Avatar, Dropdown} from "$lib/components";
    import {user} from "$lib/stores";
    import {goto} from "$app/navigation";
    import FaChevronDown from "svelte-icons/fa/FaChevronDown.svelte";
    
    const actions = [ {
        label: "Sign Out",
        action: async () => goto("/auth/logout"),
    } ];
</script>

{#if $user}
    <div class="w-full flex items-center gap-2 md:gap-4">
        <Dropdown class="w-full dropdown-handle dropdown-end" items={actions}>
            <button class="w-full flex-nowrap btn btn-ghost btn-sm md:btn-md" slot="handle">
                <span class="w-full truncate text-right text-sm md:text-base">{$user.username}</span>
                <span class="h-3/4 ml-1 md:ml-2 dropdown-icon"><FaChevronDown/></span>
            </button>
        </Dropdown>
        
        <Avatar class="hidden h-8 w-8 md:block md:h-12 md:w-12 mr-2 md:mr-4"/>
    </div>
{:else}
    <button class='btn btn-outline btn-sm md:btn-md' on:click={async () => goto("/auth/login")}>Sign In</button>
{/if}


<style lang="postcss">
    .dropdown-icon {
        @apply transition-all duration-300;
    }
    :global(.dropdown-handle):focus-within
    .dropdown-icon {
        @apply rotate-180;
    }
</style>
