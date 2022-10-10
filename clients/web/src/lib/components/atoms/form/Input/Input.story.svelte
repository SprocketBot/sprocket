<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import Input, {type InputSize} from "./Input.svelte";

    export let Hst: _Hst;

    const sizes: InputSize[] = ["sm", "md", "lg"];

    let label = "Username";
    let size: InputSize = "md";
    let placeholder = "";
    let disabled = false;
</script>

<Hst.Story title="Atoms/Input" layout={{type: "grid", width: 500}}>
    <svelte:fragment slot="controls">
        <Hst.Text title="Label" bind:value={label} />
        <Hst.Select title="Size" bind:value={size} options={sizes} />
        <Hst.Text title="Placeholder" bind:value={placeholder} />
        <Hst.Checkbox title="Disabled" bind:value={disabled} />
    </svelte:fragment>

    <Hst.Variant title="Default" {label} {size} {placeholder} {disabled}>
        <Input {label} {size} {placeholder} {disabled} />
    </Hst.Variant>
</Hst.Story>
