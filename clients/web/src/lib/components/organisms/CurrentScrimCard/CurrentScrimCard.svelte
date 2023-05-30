<script lang="ts">
    import { CurrentScrimContext } from "$lib/api";
    import { ArrowLeftOnRectangle } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { getContext } from "svelte";
    import { readable } from "svelte/store";
    import { Button } from "../../atoms";
    import { InternalSidebarContextKey, type InternalSidebarContext } from "../../molecules";
    import startCase from "lodash.startcase"
    import { ProgressBar } from "../../atoms/ProgressBar";
    import { LeaveScrimStore } from "../../../../../$houdini";

    const sidebarContext = getContext<InternalSidebarContext>(InternalSidebarContextKey) ?? readable({})
    const currentScrim = CurrentScrimContext()

    const leaveScrimStore = new LeaveScrimStore()

    async function leaveScrim() {
        await leaveScrimStore.mutate(null)
    }

    $: console.log({$currentScrim})
</script>


{#if $currentScrim}
    <!-- If no scrim, hide! -->
    {#if $sidebarContext.iconOnly}
        <!-- Minified View -->
    {:else}
        <!-- Full View -->
        <div class="text-gray-50 bg-gray-700 w-full p-2 rounded text-sm flex justify-center items-center flex-col gap-2">
            <div class="px-4 text-left w-full">
                <p class="text-base font-bold">Currently Queued</p>
                <p class="text-sm font-medium text-primary">Rocket League</p>
                <p class="text-sm font-medium text-primary">{$currentScrim.settings.competitive ? "Competitive" : "Casual"} {$currentScrim.gameMode.description}
                <p class="text-sm font-medium text-primary">{startCase($currentScrim.settings.mode.toLowerCase())} Format</p>
                <p class="text-sm font-medium text-primary">{$currentScrim.skillGroup.description}</p>    
            </div>
            <div class="flex h-4 items-center text-center w-full">
                <p class="w-6">{$currentScrim.playerCount}</p>
                <ProgressBar label="" variant="primary" size="fill" progress={($currentScrim.playerCount / $currentScrim.maxPlayers) * 100}/>
                <p class="w-6">{$currentScrim.maxPlayers}</p>
            </div>
            <Button variant="danger" size="xs" on:click={leaveScrim}>
                <Icon class="w-4" src={ArrowLeftOnRectangle}/>
                Leave Scrim
            </Button>
        </div>
    {/if}
{/if}
