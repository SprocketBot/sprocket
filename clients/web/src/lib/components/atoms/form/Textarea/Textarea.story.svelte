<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import {Props} from "$lib/histoire";
    import type {FormControlState, FormControlSize} from "../form.types";
    import Textarea from "./Textarea.svelte";

    export let Hst: _Hst;

    const sizes: FormControlSize[] = ["sm", "md", "lg"];
    const states: FormControlState[] = ["none", "valid", "invalid"];

    let label = "Description";
    let size: FormControlSize = "md";
    let placeholder = "";
    let disabled = false;
    let state: FormControlState = "none";
    let error = "";
    let value = "";
</script>

<Hst.Story title="Atoms/Form/Textarea" layout={{type: "grid", width: 500}}>
    <svelte:fragment slot="controls">
        <Hst.Text title="Label" bind:value={label} />
        <Hst.Select title="Size" bind:value={size} options={sizes} />
        <Hst.Text title="Placeholder" bind:value={placeholder} />
        <Hst.Checkbox title="Disabled" bind:value={disabled} />
        <Hst.Select title="State" bind:value={state} options={states} />
        <Hst.Text title="Error" bind:value={error} />
        <Hst.Text title="Value" bind:value />

        <Props props={{label, size, placeholder, disabled, state, error, value}} />
    </svelte:fragment>

    <Hst.Variant title="Default" {label} {size} {placeholder} {disabled} {state} {error} {value}>
        <Textarea {label} {size} {placeholder} {disabled} {state} {error} bind:value />
    </Hst.Variant>
</Hst.Story>
