<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import {Props} from "../../../../histoire";
    import type {FormControlState} from "../form.types";
    import Checkbox from "./Checkbox.svelte";

    export let Hst: _Hst;

    const states: FormControlState[] = ["none", "valid", "invalid"];

    let label = "Username";
    let value = true;

    let disabled = false;
    let state: FormControlState = "none";
    let error = "";
</script>

<Hst.Story title="Atoms/Checkbox" layout={{type: "grid", width: 500}}>
    <svelte:fragment slot="controls">
        <Hst.Text title="Label" bind:value={label} />
        <Hst.Checkbox title="Value" bind:value />

        <Hst.Checkbox title="Disabled" bind:value={disabled} />
        <Hst.Select title="State" bind:value={state} options={states} />
        <Hst.Text title="Error" bind:value={error} />

        <Props props={{label, disabled, state, error, value}} />
    </svelte:fragment>

    <Hst.Variant title="Default" {label} {disabled} {state} {error} {value}>
        <Checkbox {label} {disabled} {state} {error} bind:value />
    </Hst.Variant>
</Hst.Story>
