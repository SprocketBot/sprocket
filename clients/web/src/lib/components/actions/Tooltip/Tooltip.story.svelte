<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import type {TooltipPosition} from "./types";
    import {tooltip} from "./useTooltip.action";
    export let Hst: _Hst;

    let position: TooltipPosition = "top";
    $: console.log(position);
</script>

<Hst.Story title="Atoms/Tooltip">
    <svelte:fragment slot="controls">
        <span class="ml-8">Position:</span>
        <select bind:value={position} class="bg-transparent mx-4 my-4">
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
        </select>
    </svelte:fragment>
    <Hst.Variant title="Default">
        <div class="w-screen h-screen flex justify-center items-center">
            {#key position}
            <button
                class="border border-primary rounded-lg px-2 py-1 text-gray-200"
                use:tooltip={{content: "Test", position: position}}>{position}</button
            >
            {/key}
        </div>
    </Hst.Variant>
</Hst.Story>
