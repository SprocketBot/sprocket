<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import Drawer from "./Drawer.svelte";
    import type {DrawerPosition} from "./types";

    export let Hst: _Hst;

    let open = false;
    let position: DrawerPosition = "left";
</script>

<Hst.Story title="Atoms/Drawer" layout={{type: "grid", width: 800}}>
    <Hst.Variant title="Default">
        <button on:click={() => (open = true)}>Open the Drawer</button>

        <Drawer bind:open {position}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ad quas aperiam exercitationem est veritatis
            nobis, esse vitae aliquam error ratione delectus voluptatum possimus, doloribus accusamus? Blanditiis sit
            itaque quo odio? Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nesciunt quis quidem laudantium,
            quisquam officiis vitae, ullam iusto nostrum dolor possimus iste veniam maiores accusantium a repellat non
            sint exercitationem pariatur. Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro natus, dolores
            voluptate vel laborum, fugiat architecto aliquam officiis ea odit velit! Repellendus porro consequatur
            facere laborum hic animi ullam beatae? Lorem, ipsum dolor sit amet consectetur adipisicing elit. Alias
            ratione deleniti officiis amet sint praesentium sapiente! Quidem excepturi laborum exercitationem quos fuga
            numquam similique facilis, qui quo tempora itaque repudiandae.
        </Drawer>

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
