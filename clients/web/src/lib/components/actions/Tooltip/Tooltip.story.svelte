<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import type {TooltipParams} from "./types";
    import {tooltip} from "./useTooltip.action";
    export let Hst: _Hst;

    let params: TooltipParams = {position: "top", withArrow: true, content: "Test Tooltip"};
</script>

<Hst.Story title="Atoms/Tooltip">
    <svelte:fragment slot="controls">
        <div>
            <span class="ml-8">Position:</span>
            <select bind:value={params.position} class="bg-transparent mx-4 my-4">
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
            </select>
        </div>
        <div>
            <span class="ml-8">With Arrow</span>
            <input bind:checked={params.withArrow} type="checkbox" />
        </div>
    </svelte:fragment>
    <Hst.Variant title="Default">
        <div class="w-screen h-screen flex justify-center items-center">
            {#key params}
                <button class="border border-primary rounded-lg px-2 py-1 text-gray-200" use:tooltip={params}
                    >{params.position}</button
                >
            {/key}
        </div>
    </Hst.Variant>
</Hst.Story>
