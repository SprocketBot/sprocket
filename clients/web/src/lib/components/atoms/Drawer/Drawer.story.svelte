<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import Drawer from "./Drawer.svelte";
    import type { DrawerPosition } from "./types";

    export let Hst: _Hst;

    let open = false;
    let position: DrawerPosition = "left";
</script>

<Hst.Story title="Atoms/Drawer" layout={{type: "grid", width: 800}}>
    <Hst.Variant title="Default">
        <button on:click={() => (open = true)}>Open the Drawer</button>

        <Drawer bind:open {position}>Hello World</Drawer>

        <svelte:fragment slot="controls">
            Position: <select bind:value={position} class="px-2 py-1 rounded bg-gray-800 text-gray-200 outline-none">
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
            </select>
        </svelte:fragment>
    </Hst.Variant>
</Hst.Story>
