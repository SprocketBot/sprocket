<style lang="postcss">
    .dropdown-icon {
        @apply transition-all duration-300;
    }
    :global(.dropdown-handle):focus-within .dropdown-icon {
        @apply rotate-180;
    }
</style>

<script lang="ts">
    import FaChevronDown from "svelte-icons/fa/FaChevronDown.svelte";

    import {goto} from "$app/navigation";
    import {Avatar, Dropdown} from "$lib/components";
    import {user} from "$lib/stores";

    const actions = [
        {
            label: "Sign Out",
            action: async () => goto("/auth/logout"),
        },
    ];
</script>

{#if $user}
    <div class="w-full flex items-center gap:2 md:gap-4">
        <Dropdown class="w-full dropdown-handle dropdown-end" items={actions}>
            <button
                class="w-full flex-nowrap btn btn-ghost btn-sm"
                slot="handle"
            >
                <span class="w-full truncate text-right">{$user.username}</span>
                <span class="h-3/4 ml-2 dropdown-icon"><FaChevronDown /></span>
            </button>
        </Dropdown>

        <Avatar class="hidden h-8 w-8 md:block md:h-12 md:w-12 mr-4" />
    </div>
{:else}
    <button class="btn btn-outline" on:click={async () => goto("/auth/login")}
        >Sign In</button
    >
{/if}
