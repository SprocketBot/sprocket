<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import Avatar, { type ShapeVariant, type SizeVariant } from "./Avatar.svelte";

    export let Hst: _Hst;

    const SizeOptions: SizeVariant[] = ["sm", "rg", "md", "lg", "xl"];
    const ShapeOptions: ShapeVariant[] = ["rounded", "square", "circle"];

    let shape: ShapeVariant = "rounded";
    let size: SizeVariant = "rg";


</script>

<Hst.Story title="Atoms/Avatar">
    <svelte:fragment slot="controls">
        <Hst.Select title="Shape" bind:value={shape} options={ShapeOptions} />
        <Hst.Select title="Size" bind:value={size} options={SizeOptions}/>
        <pre class="m-2 p-2 bg-black/20 ">{JSON.stringify({size, shape}, null, 2)}</pre>
    </svelte:fragment>

    <Hst.Variant title="Default" {size} {shape}>
        <Avatar {size} {shape} alt="alt text"/>
    </Hst.Variant>
    <Hst.Variant title="Custom" {size} {shape}>
        <Avatar url="https://picsum.photos/200/300" alt="alt text" {size} {shape}/>
    </Hst.Variant>
</Hst.Story>


