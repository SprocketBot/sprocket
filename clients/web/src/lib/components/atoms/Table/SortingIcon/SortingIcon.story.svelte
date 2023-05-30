<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";

    import {Props} from "$lib/histoire";
    import SortingIcon from "./SortingIcon.svelte";
    import type {SortDirection} from "@tanstack/svelte-table";

    export let Hst: _Hst;

    const directionOptions: Record<string, SortDirection | false> = {
        false: false,
        asc: "asc",
        desc: "desc",
    };

    let directionValue: keyof typeof directionOptions = "false";
    $: direction = directionOptions[directionValue];

    let hovered = false;
</script>

<Hst.Story title="Atoms/Table/SortingIcon" layout={{type: "single"}}>
    <svelte:fragment slot="controls">
        <Hst.Select title="direction" options={directionOptions} bind:value={directionValue} />
        <Hst.Checkbox title="hovered" bind:value={hovered} />

        <Props props={{direction, hovered}} />
    </svelte:fragment>

    <Hst.Variant>
        <div class="bg-gray-600 w-12 h-12 flex items-center justify-center">
            <SortingIcon {direction} {hovered} />
        </div>
    </Hst.Variant>
</Hst.Story>
