<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import Input, {type InputSize} from "./Input.svelte";

    export let Hst: _Hst;

    const sizes: InputSize[] = ["sm", "md", "lg"];

    let size: InputSize = "md";
</script>

<Hst.Story title="Atoms/Input" layout={{type: "grid", width: 500}}>
    <svelte:fragment slot="controls">
        <Hst.Select title="Size" bind:value={size} options={sizes} />
    </svelte:fragment>

    <Hst.Variant title="Default" {size}>
        <Input label="This is an input" {size} />
    </Hst.Variant>
</Hst.Story>
